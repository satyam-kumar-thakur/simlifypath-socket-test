const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    input: { type: Object, required: false },
    variableData : { type: Object, required: false },
    output: { type: Object, required: false },
  },
  {
    timestamps: true,
    versionKey: false,
    _id: false,
  }
);

const stagesSchema = new mongoose.Schema(
  {
    inputPrompt : { type: String, required: false },
    finalResponse :  { type: String, required: false },
    request: { type: queueSchema, required: false, default: {} },
    NLPprocessor: { type: queueSchema, required: false, default: {} },
    worker: { type: queueSchema, required: false, default: {} },
    rephraser: { type: queueSchema, required: false, default: {} },
    response: { type: queueSchema, required: false, default: {} },
  },
  {
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

const jobSchema = new mongoose.Schema(
  {
    chatPlatform: { type: String, required: true },
    chatPlatformMetaData: { type: Object, required: false },
    inputMessage: { type: String, required: true },
    status: { type: String, required: false },
    userId: { type: String, required: true },
    organisationId: { type: String, required: false },
    stages: [{ type: stagesSchema, required: true }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const JobModel = mongoose.model("job", jobSchema);

module.exports = JobModel;
