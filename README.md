[![Community Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Community_Project.png)](https://opensource.newrelic.com/oss-category/#community-project)

# Victory visualizations

![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/newrelic/nr1-victory-visualizations?include_prereleases&sort=semver) [![Snyk](https://snyk.io/test/github/newrelic/nr1-victory-visualizations/badge.svg)](https://snyk.io/test/github/newrelic/nr1-victory-visualizations)

## About this Nerdpack

This Nerdpack provides NRQL-based custom visualizations built on top of the
[Victory](https://formidable.com/open-source/victory/) charting library.

## Open source license

This project is distributed under the [Apache 2 license](LICENSE).

## What do you need to make this work?

<!--
> List any prerequisites for using your app, and include links to other New Relic features when necessary.

> For example:

Required:

- [New Relic Infrastructure agent(s) installed](https://docs.newrelic.com/docs/agents/manage-apm-agents/installation/install-agent#infra-install) on your cloud computing devices and the related access to [New Relic One](https://newrelic.com/platform).

You'll get the best possible data out of this application if you also:

- [Activate the EC2 integration](https://docs.newrelic.com/docs/integrations/amazon-integrations/get-started/connect-aws-infrastructure) to group by your cloud provider account.
- [Install APM on your applications](https://docs.newrelic.com/docs/agents/manage-apm-agents/installation/install-agent#apm-install) to group by application.
-->

## Getting started

1. Ensure that you have
   [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and
   [NPM](https://www.npmjs.com/get-npm) installed. If you're unsure whether you
   have one or both of them installed, run the following commands. (If you have
   them installed, these commands return a version number; if not, the commands
   aren't recognized.)

   ```bash
   git --version
   npm -v
   ```

2. Install the [NR1
   CLI](https://one.newrelic.com/launcher/developer-center.launcher) by going to
   [the developer
   center](https://one.newrelic.com/launcher/developer-center.launcher), and
   following the instructions to install and set up your New Relic development
   environment. This should take about 5 minutes.
3. Execute the following command to clone this repository and run the code
   locally against your New Relic data:

   ```bash
   nr1 nerdpack:clone -r https://github.com/newrelic/nr1-victory-visualizations.git
   cd nr1-victory-visualizations
   nr1 nerdpack:serve
   ```

Visit
[https://one.newrelic.com/?nerdpacks=local](https://one.newrelic.com/?nerdpacks=local)
to launch your app locally.

## Deploying this Nerdpack

Open a command prompt in the app's directory and run the following commands.

```bash
# If you need to create a new uuid for the account to which you're deploying this app, use the following
# nr1 nerdpack:uuid -g [--profile=your_profile_name]
# to see a list of APIkeys / profiles available in your development environment, run nr1 credentials:list
nr1 nerdpack:publish [--profile=your_profile_name]
nr1 nerdpack:tag [-t [CURRENT]] [--profile=your_profile_name]
```

Visit [https://one.newrelic.com](https://one.newrelic.com), and launch your app
in New Relic.

# Support

New Relic has open-sourced this project. This project is provided AS-IS WITHOUT
WARRANTY OR DEDICATED SUPPORT. That said, we welcome feedback, contributions and feature requests!

There are 2 main areas to request support:

### Help with this repo

**GitHub issues/enhancement requests**: Issues and enhancement requests should be reported to the project here on GitHub. They can be submitted in the [Issues tab of this repository](../../issues). Please search for and review the existing open issues
before submitting a new issue.

**Community forum**: We also encourage you to bring your experiences and questions to the [Explorers
Hub](https://discuss.newrelic.com) where our community members collaborate on
solutions and new ideas. New Relic hosts and moderates an online forum where customers can interact with
New Relic employees as well as other customers to get help and share best
practices. Like all official New Relic open source projects, there's a related
Community topic in the New Relic Explorers Hub. You can find this project's
topic/threads here: https://discuss.newrelic.com/tag/victoryvisualizations

### Help with the Victory charting library

Support related to Victory can be found at: https://spectrum.chat/victory?tab=posts

# Contributing

Contributions are encouraged! If you submit an enhancement request, we'll invite
you to contribute the change yourself. Please review our [Contributors
Guide](CONTRIBUTING.md).

Keep in mind that when you submit your pull request, you'll need to sign the CLA
via the click-through using CLA-Assistant. If you'd like to execute our
corporate CLA, or if you have any questions, please drop us an email at
opensource+nr1-victory-visualizations@newrelic.com.
