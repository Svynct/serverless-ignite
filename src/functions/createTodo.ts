import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidV4 } from "uuid";

import { document } from "../utils/dynamodbClient";

interface ICreateTodo {
  id: string;
  title: string;
  done: boolean;
  deadline: Date;
}

export const handler: APIGatewayProxyHandler = async(event) => {
  const { title, deadline } = JSON.parse(event.body) as ICreateTodo;
  const { userid: user_id } = event.pathParameters;

  const id = uuidV4();

  await document.put({
    TableName: "users_todo",
    Item: {
      id,
      user_id,
      title,
      done: false,
      deadline: new Date(deadline).getTime()
    }
  }).promise();

  const response = await document.query({
    TableName: "users_todo",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": id
    }
  }).promise();

  const parsedItem = response.Items[0];

  Object.assign(parsedItem, {
    deadline: new Date(parsedItem.deadline)
  })

  return {
    statusCode: 201,
    body: JSON.stringify(parsedItem)
  }
}