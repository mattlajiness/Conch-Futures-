import { FUTURES_QUESTIONS } from './src/constants';
const counts = FUTURES_QUESTIONS.reduce((acc, q) => {
  acc[q.category] = (acc[q.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
console.log(counts);
