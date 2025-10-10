import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PollutionMeter = ({ pollutionIndex, fuelDistribution }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Pollution Meter</h2>
      <div className="space-y-4">
        <div className="text-center pb-4 border-b">
          <div className="text-sm text-gray-500 mb-2">Pollution Index</div>
          <div 
            className="text-6xl font-bold mb-2" 
            style={{ color: pollutionIndex > 70 ? '#ef4444' : pollutionIndex > 40 ? '#f59e0b' : '#10b981' }}
          >
            {pollutionIndex}
          </div>
          <div className="text-xs text-gray-600">out of 100</div>
          <div className={`mt-3 inline-block px-4 py-2 rounded-full text-sm font-semibold ${
            pollutionIndex > 70 ? 'bg-red-100 text-red-800' : 
            pollutionIndex > 40 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {pollutionIndex > 70 ? 'High Pollution' : pollutionIndex > 40 ? 'Moderate' : 'Low Pollution'}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500 text-center mb-2">Fuel Type Distribution</div>
          {fuelDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie 
                  data={fuelDistribution} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={60} 
                  dataKey="value" 
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {fuelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No data available
            </div>
          )}
          
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-gray-600">EV (Electric)</span>
              </div>
              <span className="font-semibold text-green-600">
                {fuelDistribution.find(f => f.name === 'EV')?.value || 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="text-gray-600">ICE (Combustion)</span>
              </div>
              <span className="font-semibold text-red-600">
                {fuelDistribution.find(f => f.name === 'ICE')?.value || 0}
              </span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t text-xs text-gray-500 text-center">
            💡 Index = (ICE / Total) × 100
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollutionMeter;