'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AssetAllocation } from '@/data/mockData';

interface AllocationChartProps {
  data: AssetAllocation[];
}

export default function AllocationChart({ data }: AllocationChartProps) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Asset Allocation</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={4}
              dataKey="percentage"
              nameKey="sector"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0D0D12',
                border: '1px solid #1F1F2E',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(0, 191, 255, 0.2)',
              }}
              labelStyle={{ color: '#FFFFFF' }}
              itemStyle={{ color: '#9CA3AF' }}
              formatter={(value, name, props) => [
                `${props.payload.percentage}% ($${props.payload.value?.toLocaleString()})`,
                props.payload.sector
              ]}
            />
            <Legend
              verticalAlign="middle"
              align="right"
              layout="vertical"
              iconType="circle"
              formatter={(value, entry) => (
                <span className="text-sm text-[#9CA3AF]">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
