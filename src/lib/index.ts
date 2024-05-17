import * as core from '@actions/core'
import AsanaClient from './asana'

async function run() {
  try {
    const asanaAccessToken = core.getInput('asana-access-token')
    const asanaWorkspaceId = core.getInput('asana-workspace-id')
    const branch = core.getInput('branch')
    const commit = core.getInput('commit')
    const ticketAction = core.getInput('ticket-section')

    const asanaClient = new AsanaClient(asanaAccessToken, asanaWorkspaceId)

    const vcsData = {
      branch,
      commit,
    }

    const ticketIds = await asanaClient.parseBranchAndCommit(vcsData)

    for (const ticketId of ticketIds) {
      switch (ticketAction) {
        case 'in progress':
          await asanaClient.taskInProgress(ticketId)
          break
        case 'code review':
          await asanaClient.taskToCodeReview(ticketId)
          break
        case 'complete':
          await asanaClient.taskComplete(ticketId)
          break
        default:
          core.warning(`Unsupported ticket action: ${ticketAction}`)
      }
    }

    core.info('Asana tasks updated successfully.')
  } catch (error: any) {
    core.setFailed(`Error updating Asana tasks: ${error.message}`)
  }
}

run()
