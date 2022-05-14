import { APIGatewayProxyHandler } from "aws-lambda";

import { document } from "../utils/dynamodbClient";

export const handler: APIGatewayProxyHandler = async(event) => {
  const { userid: user_id } = event.pathParameters;

  const response = await document.scan({
    TableName: "users_todo",
    FilterExpression: "user_id = :user_id",
    ExpressionAttributeValues: {
      ":user_id": user_id
    }
  }).promise();

  if (response) {
    const parsedItems = response.Items.map(todo => {
      if (todo.deadline) {
        todo.deadline = new Date(todo.deadline);
      }
      return todo;
    })

    return {
      statusCode: 200,
      body: JSON.stringify(parsedItems)
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Não foi encontrado nenhum TODO para o usuário"
    })
  }
}