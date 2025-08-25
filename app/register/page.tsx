import type { Metadata } from 'next';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: '회원가입',
  description: '새 계정을 생성하여 커뮤니티에 참여하세요.',
};

export default function RegisterPage() {

  return <RegisterForm />;
}
