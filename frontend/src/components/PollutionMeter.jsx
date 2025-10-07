import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PollutionMeter = ({ pollutionIndex, fuelDistribution }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Pollution Meter</h2>
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold" style={{ color: pollutionIndex > 70 ? '#ef4444' : '#10b981' }}>
            {pollutionIndex}
          </div>
          <div className="text-sm text-gray-600">Current Pollution Index</div>
          <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            pollutionIndex > 70 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {pollutionIndex > 70 ? 'Critical' : 'Normal'}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={fuelDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
              {fuelDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PollutionMeter;