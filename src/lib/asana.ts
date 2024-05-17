import * as asana from 'asana'

type GitData = {
  branch: string
  commit: string
}

class AsanaClient {
  private client: asana.ApiClient
  private tasksApiInstance: asana.TasksApi
  private sectionsApiInstance: asana.SectionsApi
  private workspaceId: string

  constructor(asanaAccessToken: string) {
    this.client = asana.ApiClient.instance
    let token = this.client.authentications['token']
    token.accessToken = asanaAccessToken
    this.tasksApiInstance = new asana.TasksApi()
    this.sectionsApiInstance = new asana.SectionsApi()
    this.workspaceId = '1199888618790669'
  }

  private async getTask(gid: string) {
    const opts = {}
    try {
      const result = await this.tasksApiInstance.getTask(gid, opts)
      console.log('Asana task found', result.data)
      return result.data
    } catch (error: any) {
      console.error('Error:', error.response.body)
      throw new Error('Failed to retrieve task: ' + error.message)
    }
  }

  private async getProjectSections(gid: string) {
    const opts = {}
    try {
      const result = await this.sectionsApiInstance.getSectionsForProject(
        gid,
        opts
      )
      console.log(
        'API called successfully. Returned project data: ' +
          JSON.stringify(result.data, null, 2)
      )
      return result.data
    } catch (error: any) {
      console.error('Error:', error.response.body)
      throw new Error('Failed to retrieve project sections: ' + error.message)
    }
  }

  private async updateTaskSection({ task_gid, sectionName }) {
    // Find asana ticket
    const task = await this.getTask(task_gid)

    // Find the tasks related DEV project (first one is likely to be the current sprint)
    const project_gid = this.getFirstDevProjectGid(task)

    // Check section/status of the task if not already in the desired section
    const activeProject = task.memberships.find(
      (member: any) => member.project.gid === project_gid
    )
    console.log('active project: ', activeProject)

    if (activeProject && activeProject.section.name !== sectionName) {
      const sections = await this.getProjectSections(project_gid)
      const section_gid = this.getSectionGid({
        name: sectionName,
        sections,
      })

      if (section_gid) {
        // Update the task to the desired section
        await this.setTaskSection(task_gid, project_gid, section_gid)
      }
    }
  }

  private async setTaskSection(
    task_gid: string,
    project_gid: string,
    in_progress_section_gid: string
  ) {
    const opts = {}
    const body = {
      data: {
        project: project_gid,
        section: in_progress_section_gid,
      },
    }

    try {
      const result = await this.tasksApiInstance.addProjectForTask(
        body,
        task_gid,
        opts
      )
      console.log(
        'API called successfully. Returned data: ' +
          JSON.stringify(result.data, null, 2)
      )
    } catch (error: any) {
      console.error('Error:', error.response.body)
      throw new Error('Failed to update task: ' + error.message)
    }
  }

  private getFirstDevProjectGid(task: asana.resources.Task): string {
    const DevProject = task.projects
      .filter((project: any) => project.name.startsWith('DEV v'))
      .shift()
    console.log('Current project: ', DevProject)
    return DevProject ? DevProject.gid : ''
  }

  private getSectionGid({ name, sections }): string {
    console.log('Sections: ', sections)
    const activeSection = sections.find((section) =>
      section.name.startsWith(name)
    )
    return activeSection ? activeSection.gid : ''
  }

  private async getGidFromCustomId(id: string): Promise<string> {
    try {
      const result = await this.tasksApiInstance.getTaskForCustomID(
        this.workspaceId,
        id
      )
      console.log('Asana task found', result.data)
      return result.data.gid
    } catch (error: any) {
      console.error('Error:', error.response.body)
      throw new Error('Failed to retrieve task: ' + error.message)
    }
  }

  private async getIdFromBranch(branch: string): Promise<string | null> {
    const sections = branch.toLowerCase().split('/')
    const customId = sections
      .find((section) => section.startsWith('dev-'))
      ?.toUpperCase()
    if (customId) {
      return await this.getGidFromCustomId(customId)
    }
    return null
  }

  private async getIdsFromCommit(commitMessage: string): Promise<string[]> {
    const gids: string[] = []

    // Find Asana URLs
    const asanaLinkMatches = commitMessage.match(/app\.asana\.com\/[^\s]+/g)
    if (asanaLinkMatches) {
      const asanaLinkGids = asanaLinkMatches
        .map((link) => {
          const match = link.match(/\/(\d+)(?:\/f)?$/)
          return match ? match[1] : null
        })
        .filter((gid) => gid !== null) as string[]
      gids.push(...asanaLinkGids)
    }

    // Find custom ID references
    const customIdPattern = /\bdev-\d+\b/gi
    const matches = commitMessage.match(customIdPattern)
    if (matches) {
      const customIds = matches.map((id) => id.toUpperCase())
      for (const id of customIds) {
        const gid = await this.getGidFromCustomId(id)
        if (gid) {
          gids.push(gid)
        }
      }
    }

    return gids
  }

  private async searchForTicketIds({
    branch,
    commit,
  }: GitData): Promise<string[]> {
    const asanaIds: string[] = []

    const branchGid = await this.getIdFromBranch(branch)
    if (branchGid) {
      asanaIds.push(branchGid)
    }

    const commitGids = await this.getIdsFromCommit(commit)
    asanaIds.push(...commitGids)

    return Array.from(new Set(asanaIds))
  }

  public async parseBranchAndCommit({
    branch,
    commit,
  }: GitData): Promise<string[]> {
    // Unique list of ticket IDs from either commit message URLs or branch name custom ID
    const ticketsToUpdate = await this.searchForTicketIds({ branch, commit })
    return ticketsToUpdate
  }

  public async taskInProgress(task_gid: string): Promise<void> {
    // Update the task to 'In progress'
    await this.updateTaskSection({ task_gid, sectionName: 'In progress' })
  }

  public async taskToCodeReview(task_gid: string): Promise<void> {
    // Update the task to in 'Code review'
    await this.updateTaskSection({ task_gid, sectionName: 'Code review' })
  }

  public async taskComplete(task_gid: string): Promise<void> {
    // Update the task to in 'Done'
    await this.updateTaskSection({ task_gid, sectionName: 'Done' })
  }
}

export default AsanaClient
