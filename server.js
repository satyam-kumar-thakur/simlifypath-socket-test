require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const connectDB = require("./db");
const {testQueue} = require("./queue.js")

const startSubscriber = require("./subscriber");
const startTestSubscriber = require("./testSubscriber");

connectDB();
startSubscriber();
startTestSubscriber();

app.use(express.json());
app.use("/", express.static(path.join(__dirname, "public")));

app.post("/admin_docs", async (req, res) => {
  try {
    const { user_id, source } = req.body;
    // Webhook URL and headers
    const webhookUrl = 'http://localhost:2000/api/v1/notification/send-notification';
    const headers = {
      'x-api-key': process.env.WEBHOOK_API_KEY,
      'x-org-id': '657bdf30a8620d08557b968f',
      'Content-Type': 'application/json'
    };

    const webhookData = {
      userId: user_id,
      title: "hello",
      body: "hello abcd",
      source: source,
    };

    await axios.post(webhookUrl, webhookData, { headers });

    res.status(200).json({ message: "Data received and webhook called successfully" });
  } catch (error) {
    console.error("Error handling /admin_docs request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/web/simplifypath-socket-event/", async (req, res) => {
  try {
    res.status(200).json({ message: "Data received and webhook called successfully" });
  } catch (error) {
    console.error("Error handling /admin_docs request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post('/enqueue', async (req, res) => {
  try {
    const { jobId, message } = req.body;
    
    if (!jobId || !message) {
      return res.status(400).json({ error: 'jobId and message are required' });
    }

    // Add job to queue
    for(let i=0; i<5; i++){
      await testQueue.add('playwrightJob', { jobId: i, message: `Running Playwright Script ${i}` });
    }

    res.json({ success: true, message: `Job ${jobId} added to queue` });
  } catch (error) {
    console.error('Error adding job to queue:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
