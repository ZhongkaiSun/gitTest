import { Capture, Match, Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import * as sns from "aws-cdk-lib/aws-sns";
import { ProcessorStack } from "../lib/state-machine-stack";

describe("ProcessorStack", () => {
  test("synthesizes the way we expect", () => {
    const app = new cdk.App();

    const topicsStack = new cdk.Stack(app, "TopicsStack");

    const topics = [new sns.Topic(topicsStack, "Topic1", {})];

    const processorStack = new ProcessorStack(app, "ProcessorStack", {
      topics: topics,
    });

    const template = Template.fromStack(processorStack);

    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs16.x",
      Handler: "index.handler",
    });

    template.resourceCountIs("AWS::SNS::Subscription", 1);

    template.hasResourceProperties(
      "AWS::IAM::Role",
      Match.objectEquals({
        AssumeRolePolicyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "sts:AssumeRole",
              Effect: "Allow",
              Principal: {
                Service: {
                  "Fn::Join": ["", ["states.", Match.anyValue(), ".amazonaws.com"]],
                },
              },
            },
          ],
        },
      })
    );
  });
});
