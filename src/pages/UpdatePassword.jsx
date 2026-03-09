import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Lock } from "lucide-react";
import DocuSphere from "../assets/DocuSphere.png";
import PrimaryButton from '../components/PrimaryButton';
import InputField from '../components/InputField';
import AuthPageHeading from '../components/AuthPageHeading';
import AuthPageSubHeading from '../components/AuthPageSubHeading';
import AuthPageLayout from '../components/Layout/AuthPageLayout';

const UpdatePassword = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = React.useState({
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all fields!')
      return
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long!')
      return
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }
    
    console.log('Form data:', formData)
    toast.success('Password updated successfully!')
    navigate('/')
  };

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
      <AuthPageHeading text="New Password" />
      <AuthPageSubHeading text="Create your new password" className="mt-9" />

      <InputField
        type="password"
        name="newPassword"
        placeholder="New Password"
        value={formData.newPassword}
        onChange={handleChange}
        icon={Lock}
        required
        className="mt-6"
      />

      <InputField
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        icon={Lock}
        required
        className="mt-6"
      />

      <PrimaryButton type="submit"> UPDATE PASSWORD </PrimaryButton>

      <div className="mb-6"></div>
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

export default UpdatePassword

