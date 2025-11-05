import { model, Schema } from "mongoose";

const IssueTypeSchema = new Schema(
  {
    issueType: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const IssueType = model("IssueType", IssueTypeSchema);
export default IssueType;
