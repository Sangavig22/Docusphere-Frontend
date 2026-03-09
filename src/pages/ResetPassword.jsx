import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DocuSphere from "../assets/DocuSphere.png";
import PrimaryButton from '../components/PrimaryButton';
import AuthPageLayout from '../components/Layout/AuthPageLayout';
import AuthPageHeading from '../components/AuthPageHeading';
import AuthPageSubHeading from '../components/AuthPageSubHeading';
const ResetPassword = () => {
  const [code, setCode] = React.useState(['', '', '', '', '', ''])
  const inputRefs = React.useRef([])
  const navigate = useNavigate()

  const handleCodeChange = (index, value) => {
    
    const digit = value.replace(/\D/g, '').slice(0, 1)
    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)

    if (digit && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
  
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const verificationCode = code.join('')

    if (verificationCode.length !== 6) {
      toast.error('OTP code must be 6 digits')
      return
    }

    console.log('Verification code:', verificationCode)
    toast.success('Code verified successfully!')
    setTimeout(() => navigate('/UpdatePassword'), 1000)
  };

  const [resendTimer, setResendTimer] = React.useState(0)
  const resendIntervalRef = React.useRef(null)

  const handleResend = () => {
    if (resendTimer > 0) return
   
    toast.info('OTP code resent to your email')
    setResendTimer(30)
    resendIntervalRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(resendIntervalRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  React.useEffect(() => {
    return () => {
      if (resendIntervalRef.current) clearInterval(resendIntervalRef.current)
    }
  }, [])

  const leftContent = (
    <img
      src={DocuSphere}
      alt="Illustration"
      loading="lazy"
      className="hidden md:block absolute inset-0 w-full h-full object-cover"
    />
  );

  const rightContent = (
    <form onSubmit={handleSubmit} className="w-full max-w-md text-center border border-white/60 rounded-xl px-8 sm:px-12 py-6 bg-white/80 backdrop-blur-15xl shadow-10xl">
      <AuthPageHeading text="Reset Password" />
      <AuthPageSubHeading text="Enter the 6-digit code" />

      <div className="flex justify-center gap-3 mt-6">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="1"
            className="w-12 sm:w-14 mt-4 h-14 sm:h-16 text-center text-lg sm:text-xl font-bold bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:border-[#114692] focus:outline-none shadow-lg transition-all duration-300"
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
          />
        ))}
      </div>

      <PrimaryButton type="submit"> VERIFY CODE </PrimaryButton>

      <p className="text-black text-lg mt-4 mb-12 font-lg font-semibold">
        Didn't receive code?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendTimer > 0}
          className={`font-medium text-lg sm:text-xl text-[#05152C] hover:text-blue-600 transition-all duration-300 ${resendTimer > 0 ? 'opacity-80 cursor-not-allowed' : ''}`}
        >
          {resendTimer > 0 ? `Resend (${resendTimer}s)` : 'Resend'}
        </button>
      </p>
    </form>
  );

  return (
    <AuthPageLayout
      leftContent={leftContent}
      rightContent={rightContent}
      leftBg="bg-[#0f1f3d]"
      rightBg="bg-white"
      isFixed={true}
      rightScroll={true}
    />
  );
}

export default ResetPassword