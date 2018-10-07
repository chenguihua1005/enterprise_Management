// mock data
const salesData = [
  {
    x: '8/2',
    y: Math.floor(Math.random() * 1000) + 200,
  },
  {
    x: '8/3',
    y: Math.floor(Math.random() * 1000) + 200,
  },
  {
    x: '8/4',
    y: Math.floor(Math.random() * 1000) + 200,
  },
  {
    x: '8/5',
    y: Math.floor(Math.random() * 1000) + 200,
  },
  {
    x: '8/6',
    y: Math.floor(Math.random() * 1000) + 200,
  },
  {
    x: '8/7',
    y: Math.floor(Math.random() * 1000) + 200,
  },
  {
    x: '8/8',
    y: Math.floor(Math.random() * 1000) + 200,
  },
];

// for (let i = 0; i < 10; i += 1) {
//   salesData.push({
//     x: `${i + 1}月`,
//     y: Math.floor(Math.random() * 1000) + 200,
//   });
// }

export const getFakeDashboardData = {
  salesData,
};

export default {
  getFakeDashboardData,
};
