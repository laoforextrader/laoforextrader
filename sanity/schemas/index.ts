import { articleSchema } from "./article"
import { brokerSchema }  from "./broker"
import { authorSchema }  from "./author"
import { likeSchema }    from "./like"
import { commentSchema } from "./comment"
import { quizSchema }    from "./quiz"
import { eaStatsSchema } from "./eaStats"
import { broadcastScheduleSchema } from "./broadcastSchedule"
import { dailyUpdateSchema } from "./dailyUpdate"

export const schemaTypes = [articleSchema, brokerSchema, authorSchema, likeSchema, commentSchema, quizSchema, eaStatsSchema, broadcastScheduleSchema, dailyUpdateSchema]
