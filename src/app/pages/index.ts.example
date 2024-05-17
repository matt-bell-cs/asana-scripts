// import asanaClient from '@/asana-scripts.mjs'
import asanaClient from '@lib/asana'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <b>Asana script testing --- check console</b>
  </div>
`

const client = new asanaClient(
  import.meta.env.VITE_ASANA_TOKEN,
  '1199888618790669'
)

// push event
// const sections = await client.taskInProgress('1207231834747452')

// pr open
// const sections = await client.taskToCodeReview('1207231834747452')

// pr closed
// const sections = await client.taskComplete('1207231834747452')

const test1 = await client.parseBranchAndCommit({
  branch: 'branch/DEV-213/fixes',
  commit:
    'Something was fixed in this ticket dev-213. https://app.asana.com/0/1206768237998493/1207131401208150/f',
})

console.log('test1', test1)

// console.log(sections)
