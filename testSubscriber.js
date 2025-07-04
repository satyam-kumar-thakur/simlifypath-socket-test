const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const { redisConnection, NLP2WorkerQueue } = require("./queue.js");
const axios = require("axios");
const JobModel = require("./job.js");

async function runPlaywrightScript(data) {
  console.log(`Processing Job ${data.jobId}: ${data.message}`);
  
  // Simulate a Playwright script execution with a timeout
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`Completed Job ${data.jobId}`);
      resolve();
    }, 3000); // Simulate a 3-second execution
  });
}

async function startTestSubscribers() {
  new Worker(
    "testQueue",
    async (job) => {
      try {
        await runPlaywrightScript(job.data);
      } catch (error) {
        console.error("Error processing data:", error);
      }
    },
    { connection: redisConnection, concurrency: 1 }
  );
}

module.exports = startTestSubscribers;
