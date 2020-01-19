"use strict";
exports.__esModule = true;

const core = require("@actions/core");
const github = require("@actions/github");
const repo = github.context.repo.repo;
const repoOwner = github.context.repo.owner;

function abort(msg) {
  const message = typeof msg === "object" ? msg.message : msg;
  console.error(message);
  throw new Error(message);
}

function ghService() {
  const token = core.getInput("token");
  return new github.GitHub(token);
}

function getOptions() {
  const rawLabels = core.getInput("labels");
  const labels = (rawLabels || "")
    .split(",")
    .map((s) => s.trim())
    .filter((v) => Boolean(v));
  const defaultBranch = core.getInput("default_branch", { required: true });
  const allPRs = core.getInput("all") === "true";
  const numLabels = labels.length;

  if (allPRs && numLabels > 0) {
    abort(
      `You must specify *either* labels *or* all: "true" but not both.  Received: { all: ${String(
        allPRs
      )}, labels: ${labels.join(",")} }`
    );
  }

  if (!allPRs && numLabels === 0) {
    abort('You must specify *either* labels *or* all: "true".');
  }

  return { labels, defaultBranch };
}

function getPRs(repo, owner) {
  return ghService()
    .pulls.list({
      owner,
      repo,
    })
    .then(({ data }) => data)
    .catch(abort);
}

function mergeBranch(repo, owner, sourceBranch, targetBranch) {
  return ghService()
    .repos.merge({
      owner,
      repo,
      base: targetBranch,
      head: sourceBranch,
      commit_message: `Automatically keeping you up to date.  Merging ${sourceBranch} into your PR.  ⏰`,
    })
    .then((merged) => {
      console.log(`Merged ${sourceBranch} into ${targetBranch}.`);
    })
    .catch((e) => {
      console.log(`Merge ${sourceBranch} into ${targetBranch} failed.`);
      abort(e);
    });
}

function hasMatchingLabel(pr, allowedLabels) {
  const prLabels = pr.labels.map(({ name }) => name);
  return allowedLabels.some((allowedLabel) => prLabels.includes(allowedLabel));
}

const filterPRs = function (prs, labels) {
  return prs.filter(function (pr) {
    if (!labels.length) {
      return true;
    }

    return hasMatchingLabel(pr, labels);
  });
};

const main = () => {
  const { labels, defaultBranch } = getOptions();
  return getPRs(repo, repoOwner)
    .then((allPRs) => filterPRs(allPRs, labels))
    .then((prs) => {
      return Promise.all(
        prs.map((pr) => {
          if (pr.base.ref !== defaultBranch) {
            return Promise.resolve();
          }
          return mergeBranch(repo, repoOwner, pr.base.ref, pr.head.ref).catch(
            abort
          );
        })
      );
    });
};

main().catch(abort);
