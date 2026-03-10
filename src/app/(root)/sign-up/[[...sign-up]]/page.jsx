import React from 'react'
import { SignUp } from '@clerk/nextjs'
const SignUpPage = () => {
  return (
    <div classname='flex flex-col max-w-3xl mx-auto w-full' >

        <section classname='space-y-6 pt-[16vh] 2xl:pt-48'>

<SignUp/>
        </section>
    </div>
  )
}

export default SignUpPage