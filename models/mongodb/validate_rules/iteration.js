exports.iterationSchema = {
  cloudantId: {
    type: String
  },
  createDate: {
    type: Date,
    required: [true, 'Creation date is required.']
  },
  createdByUserId: {
    type: String,
    required: [true, 'UserId of creator is required.']
  },
  createdBy: {
    type: String,
    required: [true, 'Name of creator is required.']
  },
  updateDate: {
    type: Date,
    default: new Date()
  },
  updatedByUserId: {
    type: String,
    default: null
  },
  updatedBy: {
    type: String,
    default: null
  },
  docStatus: {
    type: String,
    default:null
  },
  startDate: {
    type: Date,
    required: [true, 'Start date of iteration is required.']
  },
  endDate: {
    type: Date,
    required: [true, 'End date of iteration is required.']
  },
  name: {
    type: String,
    required: [true, 'Name of iteration is required.']
  },
  teamId: {
    type: String,
    required: [true, 'TeamId of iteration is required.']
  },
  memberCount: {
    type: Number,
    required: [true, 'Member count is required.']
  },
  status: {
    type: String,
    default: 'Not complete'
  },
  committedStories: {
    type: Number,
    default: null
  },
  deliveredStories: {
    type: Number,
    default: null
  },
  commitedStoryPoints: {
    type: Number,
    default: null
  },
  storyPointsDelivered: {
    type: Number,
    default: null
  },
  locationScore: {
    type: Number,
    default: null
  },
  deployments: {
    type: Number,
    default: null
  },
  defects: {
    type: Number,
    default: null
  },
  clientSatisfaction: {
    type: Number,
    default: null
  },
  teamSatisfaction: {
    type: Number,
    default: null
  },
  comment: {
    type: String,
    default: null
  },
  memberChanged: {
    type: Boolean,
    default: false
  },
};
