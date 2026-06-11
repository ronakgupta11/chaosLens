export interface ComponentItem {
  id: string
  name: string
  type: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
}

export interface ComponentGroup {
  id: string
  label: string
  items: ComponentItem[]
}

export const componentGroups: ComponentGroup[] = [
  {
    id: 'compute',
    label: 'COMPUTE',
    items: [
      { id: 'ec2', name: 'EC2', type: 'EC2', icon: 'Server', color: '#60a5fa', bgColor: '#1e3a5f', borderColor: '#1d4ed8' },
      { id: 'lambda', name: 'Lambda', type: 'Lambda', icon: 'Zap', color: '#fbbf24', bgColor: '#3d2006', borderColor: '#d97706' },
      { id: 'ecs', name: 'ECS', type: 'ECS', icon: 'Box', color: '#60a5fa', bgColor: '#0d2040', borderColor: '#1d4ed8' },
      { id: 'eks', name: 'EKS', type: 'EKS', icon: 'Layers', color: '#818cf8', bgColor: '#1e1b4b', borderColor: '#4f46e5' },
      { id: 'fargate', name: 'Fargate', type: 'Fargate', icon: 'Package', color: '#34d399', bgColor: '#022c22', borderColor: '#059669' },
      { id: 'batch', name: 'Batch', type: 'Batch', icon: 'PlaySquare', color: '#94a3b8', bgColor: '#1e293b', borderColor: '#475569' },
    ],
  },
  {
    id: 'networking',
    label: 'NETWORKING',
    items: [
      { id: 'alb', name: 'ALB', type: 'ALB', icon: 'Network', color: '#22d3ee', bgColor: '#0c2f3d', borderColor: '#0891b2' },
      { id: 'nlb', name: 'NLB', type: 'NLB', icon: 'GitFork', color: '#22d3ee', bgColor: '#0c2f3d', borderColor: '#0891b2' },
      { id: 'apigw', name: 'API GW', type: 'APIGateway', icon: 'Globe', color: '#38bdf8', bgColor: '#0a2540', borderColor: '#0369a1' },
      { id: 'cloudfront', name: 'CloudFront', type: 'CloudFront', icon: 'Cloud', color: '#c084fc', bgColor: '#2e1661', borderColor: '#7c3aed' },
      { id: 'route53', name: 'Route 53', type: 'Route53', icon: 'MapPin', color: '#fb923c', bgColor: '#3d1500', borderColor: '#c2410c' },
      { id: 'vpc', name: 'VPC', type: 'VPC', icon: 'Shield', color: '#94a3b8', bgColor: '#1e293b', borderColor: '#475569' },
    ],
  },
  {
    id: 'data',
    label: 'DATA',
    items: [
      { id: 'rds', name: 'RDS', type: 'RDS', icon: 'Database', color: '#a78bfa', bgColor: '#3b1f6e', borderColor: '#7c3aed' },
      { id: 'aurora', name: 'Aurora', type: 'Aurora', icon: 'Database', color: '#c4b5fd', bgColor: '#2e1b69', borderColor: '#6d28d9' },
      { id: 'dynamodb', name: 'DynamoDB', type: 'DynamoDB', icon: 'HardDrive', color: '#34d399', bgColor: '#022c22', borderColor: '#059669' },
      { id: 'elasticache', name: 'ElastiCache', type: 'ElastiCache', icon: 'Cpu', color: '#2dd4bf', bgColor: '#0a2e2b', borderColor: '#0d9488' },
      { id: 's3', name: 'S3', type: 'S3', icon: 'Archive', color: '#4ade80', bgColor: '#0f3320', borderColor: '#16a34a' },
      { id: 'redshift', name: 'Redshift', type: 'Redshift', icon: 'BarChart3', color: '#f9a8d4', bgColor: '#3d0f25', borderColor: '#be185d' },
    ],
  },
  {
    id: 'messaging',
    label: 'MESSAGING',
    items: [
      { id: 'sqs', name: 'SQS', type: 'SQS', icon: 'List', color: '#f472b6', bgColor: '#3d0f25', borderColor: '#db2777' },
      { id: 'sns', name: 'SNS', type: 'SNS', icon: 'Bell', color: '#fb923c', bgColor: '#3d1500', borderColor: '#ea580c' },
      { id: 'eventbridge', name: 'EventBridge', type: 'EventBridge', icon: 'Radio', color: '#a78bfa', bgColor: '#2e1661', borderColor: '#7c3aed' },
      { id: 'kinesis', name: 'Kinesis', type: 'Kinesis', icon: 'Activity', color: '#22d3ee', bgColor: '#0c2f3d', borderColor: '#0891b2' },
    ],
  },
  {
    id: 'observability',
    label: 'OBSERVABILITY',
    items: [
      { id: 'cloudwatch', name: 'CloudWatch', type: 'CloudWatch', icon: 'Eye', color: '#fb923c', bgColor: '#3d1a00', borderColor: '#d97706' },
      { id: 'xray', name: 'X-Ray', type: 'XRay', icon: 'Crosshair', color: '#60a5fa', bgColor: '#1e3a5f', borderColor: '#2563eb' },
    ],
  },
]

export const NODE_COLORS: Record<string, { border: string; fill: string; text: string }> = {
  EC2:        { border: '#1d4ed8', fill: '#1e3a5f', text: '#60a5fa' },
  ECS:        { border: '#1d4ed8', fill: '#0d2040', text: '#60a5fa' },
  EKS:        { border: '#4f46e5', fill: '#1e1b4b', text: '#818cf8' },
  Lambda:     { border: '#d97706', fill: '#3d2006', text: '#fbbf24' },
  Fargate:    { border: '#059669', fill: '#022c22', text: '#34d399' },
  Batch:      { border: '#475569', fill: '#1e293b', text: '#94a3b8' },
  ALB:        { border: '#0891b2', fill: '#0c2f3d', text: '#22d3ee' },
  NLB:        { border: '#0891b2', fill: '#0c2f3d', text: '#22d3ee' },
  APIGateway: { border: '#0369a1', fill: '#0a2540', text: '#38bdf8' },
  CloudFront: { border: '#7c3aed', fill: '#2e1661', text: '#c084fc' },
  Route53:    { border: '#c2410c', fill: '#3d1500', text: '#fb923c' },
  VPC:        { border: '#475569', fill: '#1e293b', text: '#94a3b8' },
  RDS:        { border: '#7c3aed', fill: '#3b1f6e', text: '#a78bfa' },
  Aurora:     { border: '#6d28d9', fill: '#2e1b69', text: '#c4b5fd' },
  DynamoDB:   { border: '#059669', fill: '#022c22', text: '#34d399' },
  ElastiCache:{ border: '#0d9488', fill: '#0a2e2b', text: '#2dd4bf' },
  S3:         { border: '#16a34a', fill: '#0f3320', text: '#4ade80' },
  Redshift:   { border: '#be185d', fill: '#3d0f25', text: '#f9a8d4' },
  SQS:        { border: '#db2777', fill: '#3d0f25', text: '#f472b6' },
  SNS:        { border: '#ea580c', fill: '#3d1500', text: '#fb923c' },
  EventBridge:{ border: '#7c3aed', fill: '#2e1661', text: '#a78bfa' },
  Kinesis:    { border: '#0891b2', fill: '#0c2f3d', text: '#22d3ee' },
  CloudWatch: { border: '#d97706', fill: '#3d1a00', text: '#fb923c' },
  XRay:       { border: '#2563eb', fill: '#1e3a5f', text: '#60a5fa' },
  // fallback
  DEFAULT:    { border: '#3a3a3a', fill: '#1a1a1a', text: '#888888' },
}
