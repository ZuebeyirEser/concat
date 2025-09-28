import { Link } from '@tanstack/react-router'
import { Button } from '../../ui/button'

const NotFound = () => {
  return (
    <div
      className="flex h-screen flex-col items-center justify-center p-4"
      data-testid="not-found"
    >
      <div className="z-10 flex items-center">
        <div className="ml-4 flex flex-col items-center justify-center p-4">
          <h1 className="mb-4 text-6xl font-bold leading-none md:text-8xl">
            404
          </h1>
          <h2 className="mb-2 text-2xl font-bold">Oops!</h2>
        </div>
      </div>

      <p className="z-10 mb-4 text-center text-lg text-muted-foreground">
        The page you are looking for was not found.
      </p>

      <div className="z-10">
        <Link to="/">
          <Button className="mt-4">Go Back</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
