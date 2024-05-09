// import asanaClient from '@/asana-scripts.mjs'
import asanaClient from '@lib/asana'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <b>Asana script testing --- check console</b>
  </div>
`

const client = new asanaClient(import.meta.env.VITE_ASANA_TOKEN)

// const sections = await client.taskInProgress('1207231834747452')
// const sections = await client.taskToCodeReview('1207231834747452')
// const sections = await client.taskComplete('1207231834747452')

// console.log(sections)
