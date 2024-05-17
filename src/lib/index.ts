import * as core from '@actions/core'
import AsanaClient from './asana'

async function run() {
  try {
    const asanaAccessToken = core.getInput('asana-access-token')
    const asanaWorkspaceId = core.getInput('asana-workspace-id')
    const branch = core.getInput('branch')
    const commit = core.getInput('commit')
    const ticketAction = core.getInput('ticket-action')

    const asanaClient = new AsanaClient(asanaAccessToken, asanaWorkspaceId)

    const vcsData = {
      branch,
      commit,
    }

    const ticketIds = await asanaClient.parseBranchAndCommit(vcsData)

    ticketIds.forEach((ticketId) => {
      if (ticketAction === 'in progress') {
        asanaClient.taskInProgress(ticketId)
      }

      if (ticketAction === 'code review') {
        asanaClient.taskToCodeReview(ticketId)
      }

      if (ticketAction === 'complete') {
        asanaClient.taskComplete(ticketId)
      }
    })
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
