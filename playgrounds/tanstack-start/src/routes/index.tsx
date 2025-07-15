import { createFileRoute } from '@tanstack/react-router'
import { NButton } from '~/components/NButton'
export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="p-2">
      <h3>Welcome Home!!!</h3>
      <NButton  type="button" onClick={(e) => console.log(e.detail?.count)}>
        Click Me
        <span>Red text</span>
      </NButton>
    </div>
  )
}
