import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  img: {
    type: String,
  },
  text: {
    type: String
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() +  24 * 60 * 60 * 1000  // 24 hours from now
  }
}, { timestamps: true });

// Create a TTL index on the expiresAt field
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Story = mongoose.model('Story', storySchema);

export default Story;
