import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { userLoginSchema, type UserLoginFormData } from '@/app/core/auth/schema/authSchema'
import { loginUser } from '@/app/shared/services/authService'
import { useAuth } from '@/app/core/auth/data/useAuth'
import logo from '@/../assets/images/logo.svg'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginFormData>({
    resolver: zodResolver(userLoginSchema),
  })

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (data: UserLoginFormData) => {
    setLoading(true)
    try {
      await loginUser(data.email, data.password)
      navigate('/')
    } catch {
      // error toast is handled by alovaInstance
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-200 px-8">
      <div className="flex justify-center items-center gap-32.5">
        <img src={logo} alt="ProRetoque.photo" className="hidden w-141 lg:block" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-97 flex-col gap-6 rounded-4xl bg-white p-6"
        >
          <h1 className="font-raleway text-h1 leading-12 font-bold text-blue-200">
            Inicia Sesión
          </h1>

          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                placeholder="example@gmail.com"
                {...register('email')}
                className="h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-base shadow-xs placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
              {errors.email && (
                <span className="text-sm text-error-text">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input
                type="password"
                placeholder="***********"
                {...register('password')}
                className="h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-base shadow-xs placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
              {errors.password && (
                <span className="text-sm text-error-text">{errors.password.message}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="font-raleway h-9 w-full rounded-[10px] bg-blue-200 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Accediendo...' : 'Acceder'}
          </button>
        </form>
      </div>
    </div>
  )
}
