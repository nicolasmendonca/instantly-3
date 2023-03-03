import { Button } from '@chakra-ui/react'
import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { InstantlyFirebaseClient } from 'instantly-firebase-client';

const instantlyFirebaseClient = new InstantlyFirebaseClient()

function App() {
  return (
    <>
      <Navbar />
      <Button onClick={instantlyFirebaseClient.authenticateWithGoogle}>Login</Button>
    </>
  )
}

export default App
