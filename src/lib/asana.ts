import * as asana from 'asana'

class AsanaClient {
  private client: asana.ApiClient
  private tasksApiInstance: asana.TasksApi
  private sectionsApiInstance: asana.SectionsApi

  constructor(asanaAccessToken: string) {
    this.client = asana.ApiClient.instance
    let token = this.client.authentications['token']
    token.accessToken = asanaAccessToken
    this.tasksApiInstance = new asana.TasksApi()
    this.sectionsApiInstance = new asana.SectionsApi()
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
