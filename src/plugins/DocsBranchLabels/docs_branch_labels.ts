import { PRContext } from "../../types";
import { Application } from "probot";
import { REPO_DOCS } from "../../const";
import { filterEventByRepo } from "../../util/filter_event_repo";
import { WebhookPayloadIssuesIssue } from "@octokit/webhooks";

const NAME = "DocsBranchLabels";

const BRANCHES = ["current", "beta", "next"];

export const initDocsBranchLabels = (app: Application) => {
  app.on(
    ["pull_request.opened", "pull_request.edited"],
    filterEventByRepo(NAME, [REPO_DOCS], runDocsBranchLabels)
  );
};

export const runDocsBranchLabels = async (context: PRContext) => {
  const pr = context.payload.pull_request;
  context.log(
    NAME,
    `Running on ${context.payload.repository.name}#${pr.number}`
  );

  const targetBranch = pr.base.ref;
  // Typing is wrong for PRs, so use labels type from issues
  const currentLabels = (pr.labels as WebhookPayloadIssuesIssue["labels"]).map(
    (label) => label.name
  );
  const tasks: Promise<unknown>[] = [];
  context.log(NAME, `Current labels: ${currentLabels}`);

  if (
    BRANCHES.includes(targetBranch) &&
    !currentLabels.includes(targetBranch)
  ) {
    context.log(NAME, `Adding label ${targetBranch} to PR ${pr.number}`);
    tasks.push(
      context.github.issues.addLabels({
        ...context.issue(),
        labels: [targetBranch],
      })
    );
  }

  // Find labels to remove
  const toRemove = currentLabels.filter(
    (label) => BRANCHES.includes(label) && label !== targetBranch
  );
  context.log(NAME, `Removing labels: ${toRemove}`);
  toRemove.forEach((label) =>
    tasks.push(
      context.github.issues.removeLabel({ ...context.issue(), name: label })
    )
  );

  if (tasks.length) {
    await Promise.all(tasks);
  }
};
