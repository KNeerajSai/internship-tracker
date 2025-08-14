# 🔍 DynamoDB Setup & Indexing Strategy Analysis

## Current State: NO DynamoDB Implementation! ⚠️

### Key Finding
Your internship tracker app **does NOT use DynamoDB** or any database. It uses **browser localStorage** for all data persistence, which is:
- Client-side only
- Single-user
- Non-scalable
- No server-side data storage

### Evidence
1. **No AWS SDK imports** in the main application
2. **No DynamoDB client configuration**
3. **All data operations use localStorage**:
```javascript
// From app/page.tsx
useEffect(() => {
  localStorage.setItem("internships", JSON.stringify(internships));
}, [internships]);

useEffect(() => {
  localStorage.setItem("resumes", JSON.stringify(resumes));
}, [resumes]);
```

## Why DynamoDB is Needed

For a scalable multi-user application, you need proper database architecture. Here's a complete DynamoDB implementation plan:

## Proposed DynamoDB Schema Design

### 1. Primary Table: `InternshipTracker`

```javascript
// Single Table Design Pattern
{
  TableName: 'InternshipTracker',
  KeySchema: [
    {
      AttributeName: 'PK',  // Partition Key
      KeyType: 'HASH'
    },
    {
      AttributeName: 'SK',  // Sort Key
      KeyType: 'RANGE'
    }
  ],
  AttributeDefinitions: [
    { AttributeName: 'PK', AttributeType: 'S' },
    { AttributeName: 'SK', AttributeType: 'S' },
    { AttributeName: 'GSI1PK', AttributeType: 'S' },
    { AttributeName: 'GSI1SK', AttributeType: 'S' },
    { AttributeName: 'GSI2PK', AttributeType: 'S' },
    { AttributeName: 'GSI2SK', AttributeType: 'S' },
    { AttributeName: 'status', AttributeType: 'S' },
    { AttributeName: 'deadline', AttributeType: 'S' }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'GSI1',
      Keys: {
        PartitionKey: 'GSI1PK',
        SortKey: 'GSI1SK'
      },
      Projection: 'ALL'
    },
    {
      IndexName: 'GSI2',
      Keys: {
        PartitionKey: 'GSI2PK',
        SortKey: 'GSI2SK'
      },
      Projection: 'ALL'
    },
    {
      IndexName: 'StatusIndex',
      Keys: {
        PartitionKey: 'status',
        SortKey: 'deadline'
      },
      Projection: 'ALL'
    }
  ]
}
```

### 2. Access Patterns & Index Usage

#### Pattern 1: Get all internships for a user
```javascript
// Primary Key Query
{
  PK: 'USER#123',
  SK: 'INTERNSHIP#' // begins_with
}
// ✅ Uses primary index - FAST
```

#### Pattern 2: Get internships by status
```javascript
// GSI Query on StatusIndex
{
  status: 'interview',
  deadline: '2024-01-01' // greater_than
}
// ✅ Uses StatusIndex - NO SCAN NEEDED
```

#### Pattern 3: Get user's resumes
```javascript
// Primary Key Query
{
  PK: 'USER#123',
  SK: 'RESUME#' // begins_with
}
// ✅ Uses primary index - FAST
```

#### Pattern 4: Get alerts by date
```javascript
// GSI1 Query
{
  GSI1PK: 'USER#123#ALERTS',
  GSI1SK: '2024-01-15' // begins_with for date range
}
// ✅ Uses GSI1 - NO SCAN NEEDED
```

### 3. Entity Patterns

```javascript
// User Profile
{
  PK: 'USER#123',
  SK: 'PROFILE',
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: '2024-01-01'
}

// Internship
{
  PK: 'USER#123',
  SK: 'INTERNSHIP#2024-01-15#456',
  GSI1PK: 'COMPANY#Google',
  GSI1SK: 'USER#123',
  GSI2PK: 'STATUS#interview',
  GSI2SK: '2024-01-20#USER#123',
  company: 'Google',
  position: 'SWE Intern',
  status: 'interview',
  deadline: '2024-01-20',
  // ... other fields
}

// Resume
{
  PK: 'USER#123',
  SK: 'RESUME#789',
  GSI1PK: 'RESUME#TYPE#technical',
  GSI1SK: 'USER#123',
  name: 'Technical Resume v2',
  url: 's3://bucket/resumes/789.pdf',
  tags: ['software', 'backend']
}

// Alert
{
  PK: 'USER#123',
  SK: 'ALERT#2024-01-15#999',
  GSI1PK: 'USER#123#ALERTS',
  GSI1SK: '2024-01-15#999',
  type: 'deadline',
  message: 'Google application deadline tomorrow',
  read: false
}
```

## Implementation Code

### 1. DynamoDB Client Setup

```javascript
// lib/dynamodb.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

export const docClient = DynamoDBDocumentClient.from(client);

// Optimized query helper
export async function queryWithIndex(params: {
  indexName?: string;
  pk: string;
  sk?: string;
  skBeginsWith?: string;
  limit?: number;
}) {
  const { indexName, pk, sk, skBeginsWith, limit = 50 } = params;
  
  const queryParams = {
    TableName: 'InternshipTracker',
    ...(indexName && { IndexName: indexName }),
    KeyConditionExpression: sk 
      ? 'PK = :pk AND SK = :sk'
      : skBeginsWith 
        ? 'PK = :pk AND begins_with(SK, :sk)'
        : 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': pk,
      ...(sk && { ':sk': sk || skBeginsWith })
    },
    Limit: limit,
    ScanIndexForward: false // Most recent first
  };
  
  const response = await docClient.send(new QueryCommand(queryParams));
  return response.Items || [];
}
```

### 2. Repository Pattern with Index Usage

```javascript
// repositories/internshipRepository.ts
export class InternshipRepository {
  // ✅ GOOD: Uses index query
  async getByUser(userId: string) {
    return queryWithIndex({
      pk: `USER#${userId}`,
      skBeginsWith: 'INTERNSHIP#'
    });
  }
  
  // ✅ GOOD: Uses StatusIndex
  async getByStatus(status: string, afterDate?: string) {
    return queryWithIndex({
      indexName: 'StatusIndex',
      pk: status,
      sk: afterDate // For pagination
    });
  }
  
  // ✅ GOOD: Uses GSI1 for company search
  async getByCompany(company: string) {
    return queryWithIndex({
      indexName: 'GSI1',
      pk: `COMPANY#${company}`
    });
  }
  
  // ❌ BAD: Would require SCAN
  // async searchByKeyword(keyword: string) {
  //   // This would need ElasticSearch or DynamoDB Streams + OpenSearch
  // }
  
  // ✅ GOOD: Batch write for efficiency
  async createMany(userId: string, internships: any[]) {
    const items = internships.map(i => ({
      PutRequest: {
        Item: {
          PK: `USER#${userId}`,
          SK: `INTERNSHIP#${i.dateAdded}#${i.id}`,
          GSI1PK: `COMPANY#${i.company}`,
          GSI1SK: `USER#${userId}`,
          GSI2PK: `STATUS#${i.status}`,
          GSI2SK: `${i.deadline}#USER#${userId}`,
          ...i
        }
      }
    }));
    
    // Batch write in chunks of 25
    const chunks = [];
    for (let i = 0; i < items.length; i += 25) {
      chunks.push(items.slice(i, i + 25));
    }
    
    return Promise.all(
      chunks.map(chunk => 
        docClient.send(new BatchWriteCommand({
          RequestItems: { InternshipTracker: chunk }
        }))
      )
    );
  }
}
```

### 3. Optimized API Routes

```javascript
// app/api/internships/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { InternshipRepository } from '@/repositories/internshipRepository';

const repo = new InternshipRepository();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const userId = request.headers.get('x-user-id'); // From auth middleware
  
  try {
    let items;
    
    if (status && status !== 'all') {
      // ✅ Uses StatusIndex - NO SCAN
      items = await repo.getByStatus(status);
      // Filter by user in memory (still faster than scan)
      items = items.filter(i => i.SK.includes(`USER#${userId}`));
    } else {
      // ✅ Uses primary index - FAST
      items = await repo.getByUser(userId);
    }
    
    return NextResponse.json({ internships: items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
```

## Performance Comparison

### Current localStorage Approach
- **Scalability**: ❌ Single user only
- **Performance**: ❌ O(n) for all operations
- **Persistence**: ❌ Lost on browser clear
- **Multi-device**: ❌ No sync
- **Cost**: ✅ Free

### Proposed DynamoDB with Indexes
- **Scalability**: ✅ Millions of users
- **Performance**: ✅ O(1) with proper indexes
- **Persistence**: ✅ Durable storage
- **Multi-device**: ✅ Real-time sync
- **Cost**: 💰 ~$25/month for 10k users

## Migration Strategy

### Phase 1: Dual Write (Week 1-2)
```javascript
// Save to both localStorage and DynamoDB
const saveInternship = async (data) => {
  // Local save (immediate UI update)
  localStorage.setItem('internships', JSON.stringify(data));
  
  // Async save to DynamoDB
  await fetch('/api/internships', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};
```

### Phase 2: Read from DynamoDB (Week 3-4)
```javascript
// Fallback to localStorage if API fails
const loadInternships = async () => {
  try {
    const response = await fetch('/api/internships');
    return await response.json();
  } catch (error) {
    // Fallback to local
    return JSON.parse(localStorage.getItem('internships') || '[]');
  }
};
```

### Phase 3: Remove localStorage (Week 5)
- Complete migration to DynamoDB
- Add caching layer with Redis
- Implement real-time subscriptions

## Cost Analysis for DynamoDB

### For 10,000 Users:
- **Storage**: 10GB = $2.50/month
- **Write Units**: 50 WCU = $30/month  
- **Read Units**: 100 RCU = $15/month
- **GSI Storage**: 5GB = $1.25/month
- **Total**: ~$49/month

### Optimization Tips:
1. Use DynamoDB On-Demand for variable traffic
2. Enable auto-scaling for predictable patterns
3. Use DAX (caching) for hot data
4. Archive old data to S3

## Conclusion

**Current State**: The app has NO DynamoDB implementation - it's purely client-side with localStorage.

**Critical Issues**:
1. Cannot support multiple users
2. No server-side persistence
3. No query optimization possible
4. No real-time features

**Recommendation**: Implement the proposed DynamoDB schema with proper indexes to avoid scans and enable multi-user scalability. The single-table design with GSIs provides optimal query patterns for all access needs.