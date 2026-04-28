import { articleSchema } from "./article"
import { brokerSchema }  from "./broker"
import { authorSchema }  from "./author"
import { likeSchema }    from "./like"
import { commentSchema } from "./comment"

export const schemaTypes = [articleSchema, brokerSchema, authorSchema, likeSchema, commentSchema]
