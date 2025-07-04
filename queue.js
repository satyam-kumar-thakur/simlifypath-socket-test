const { Queue } = require("bullmq");
const IORedis = require("ioredis");
require("dotenv").config();

const redisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "",
  maxRetriesPerRequest: null,
};
console.log(redisOptions);
const redisConnection = new IORedis(redisOptions);

const request2NLPQueue = new Queue(process.env.REQUEST_2_NLP, {
  connection: redisConnection,
});
const NLP2WorkerQueue = new Queue(process.env.NLP_2_WORKER, {
  connection: redisConnection,
});
const testQueue = new Queue("testQueue", {
  connection: redisConnection,
});
// const worker2NLPQueue = new Queue(process.envWORKER_2_NLP, {
//   connection: redisConnection,
// });
// const NLP2requestQueue = new Queue(process.envNLP_2_REQUEST, {
//   connection: redisConnection,
// });

module.exports = {
  request2NLPQueue,
  NLP2WorkerQueue,
  redisConnection,
  testQueue,
};
