import React from 'react'
import {
  Server, Zap, Box, Layers, Package, PlaySquare,
  Network, GitFork, Globe, Cloud, MapPin, Shield,
  Database, HardDrive, Cpu, Archive, BarChart3,
  List, Bell, Radio, Activity, Eye, Crosshair,
  Monitor, Hash
} from 'lucide-react'

interface NodeIconProps {
  type: string
  color: string
  size?: number
}

const iconMap: Record<string, React.ElementType> = {
  EC2: Server,
  Lambda: Zap,
  ECS: Box,
  EKS: Layers,
  Fargate: Package,
  Batch: PlaySquare,
  ALB: Network,
  NLB: GitFork,
  APIGateway: Globe,
  CloudFront: Cloud,
  Route53: MapPin,
  VPC: Shield,
  RDS: Database,
  Aurora: Database,
  DynamoDB: HardDrive,
  ElastiCache: Cpu,
  S3: Archive,
  Redshift: BarChart3,
  SQS: List,
  SNS: Bell,
  EventBridge: Radio,
  Kinesis: Activity,
  CloudWatch: Eye,
  XRay: Crosshair,
  Monitor: Monitor,
}

export default function NodeIcon({ type, color, size = 16 }: NodeIconProps) {
  const Icon = iconMap[type] ?? Hash
  return <Icon size={size} color={color} strokeWidth={1.5} />
}
