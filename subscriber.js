const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const { redisConnection, NLP2WorkerQueue } = require("./queue.js");
const axios = require("axios");
const JobModel = require("./job.js");

async function startSubscribers() {
  new Worker(
    "strequest2NLP",
    async (job) => {
      console.log(job.data);
      try {
        const apiUrl = "https://staging-nlp.simplifypath.com/process-job";

        let u = await JobModel.findOne({
          _id: job.data.jobId,
        });
        let message = u?.inputMessage || u?.message;

        // Check if u.stages[0].response has a variableData field
        if (
          u.stages &&
          u.stages.length > 0 &&
          u.stages[0].response &&
          u.stages[0].response.variableData
        ) {
          const variableData = u.stages[0].response.variableData;

          // Check if any field in variableData is null
          const anyFieldNull = Object.values(variableData).some(
            (field) => field === null
          );

          // If none of the fields are null, concatenate it to the message variable
          if (!anyFieldNull) {
            const variableDataString = Object.entries(variableData)
              .map(([key, value]) => {
                switch (key.toLowerCase()) {
                  case "datestart":
                    return `for ${value}`;
                  default:
                    return `${key.toLowerCase()}=${value}`;
                }
              })
              .join(" ");
            message += " " + variableDataString;
          }
        }
        if (job.data.missing && job.data.missing !== "") {
          //concatnate all value here eg { date: 'today', startTime: '5pm', attendees: 'satyam@gmail.com' }
          //schedule a call date=today startTime=5pm attendees=satyam@gmail.com
          message +=
            " " +
            Object.entries(job.data.missing)
              .map(([key, value]) => `${key}=${value}`)
              .join(" ");
        }
        console.log("final message " + message);
        console.log("final message " + message);

        let dataToAdd;

        if (job.data.message === "hi") {
          dataToAdd = {
            userId: job.data.userId,
            jobId: job.data.jobId,
            organizationId: "657bdf30a8620d08557b968f",
            userRole: "admin",
            userInput: "hello",
            intents: [
              {
                action: "apply_leave",
                category: "HRMS",
                app: "keka",
                data: {
                  leaveType: "",
                  reason: "",
                  noOfDay: "",
                  dateStart: "",
                  dateEnd: "",
                  firstHalf: false,
                  secondHalf: false,
                  app: "",
                },
              },
            ],
          };
        }
        console.log(
          "Data being added to queue:",
          JSON.stringify(dataToAdd, null, 2)
        );

        await NLP2WorkerQueue.add("test", dataToAdd);

        // let response = await axios.post(apiUrl, { data: message });
        // const responseDataObject = JSON.parse(response.data);
        // console.log("response" + JSON.stringify(responseDataObject));
        // responseDataObject.userId = job.data.userId;
        // responseDataObject.jobId = job.data.jobId;

        // const formattedResponse = JSON.stringify(responseDataObject, null, 2);
        // console.log(formattedResponse);

        // await NLP2WorkerQueue.add("test", responseDataObject);
      } catch (error) {
        console.error("Error processing data:", error);
      }
    },
    { connection: redisConnection }
  );
}

module.exports = startSubscribers;
