"use client";

import { useLanguage } from '@/lib/language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Award, Globe, Target, Heart } from 'lucide-react';

export default function AboutPage() {
  const { t, language } = useLanguage();

  const aboutContent = {
    en: {
      title: "About Psychometrics",
      subtitle: "Professional Psychological Assessment & Evaluation",
      description: "Psychometrics is the first professional organization in Mongolia providing standardized, reliable, and valid psychological assessment tests with certified quality, reliability, and validity standards.",
      
      mission: {
        title: "Our Mission",
        content: "To provide scientific-based professional support for decision-making through psychological assessment evaluation, making quality psychological testing available to everyone across Mongolia."
      },
      
      vision: {
        title: "Our Vision",
        content: "To become the leading platform for psychological assessment in Mongolia, fostering a community of well-trained professionals who contribute to mental health and organizational development."
      },
      
      features: [
        {
          icon: <BookOpen className="w-6 h-6" />,
          title: "Psychological Assessment",
          description: "Comprehensive psychological evaluation including mental health, personality, intelligence quotient, professional skills, and attitude assessments."
        },
        {
          icon: <Users className="w-6 h-6" />,
          title: "Professional Consultation",
          description: "Expert consultation services including stress management, human resource selection evaluation, and employee development training."
        },
        {
          icon: <Award className="w-6 h-6" />,
          title: "Standardized Tests",
          description: "Our IQ test meets psychometric validity standards verified by Oxford University research and scientific methodology."
        },
        {
          icon: <Globe className="w-6 h-6" />,
          title: "Online Evaluation Center",
          description: "Access psychological assessments from anywhere in the world, anytime, with live results and intelligent talent analytics solutions."
        },
        {
          icon: <Target className="w-6 h-6" />,
          title: "Talent Recognition",
          description: "Help organizations identify and develop their most valuable capital - human talent through comprehensive assessment tools."
        },
        {
          icon: <Heart className="w-6 h-6" />,
          title: "10+ Years Experience",
          description: "Professional team with over 10 years of experience in psychological testing diagnosis, providing expert advice and consultation services."
        }
      ],
      
      stats: {
        title: "Platform Statistics",
        items: [
          { label: "Years of Experience", value: "10+" },
          { label: "Assessment Types", value: "5+" },
          { label: "Partner Organizations", value: "50+" },
          { label: "Success Rate", value: "95%" }
        ]
      },
      
      contact: {
        title: "Get in Touch",
        content: "Have questions about our psychological assessment services? We're here to help you make informed decisions.",
        email: "info@psychometrics.mn",
        phone: "+976 7000-7188"
      }
    },
    mn: {
      title: "Психометрийн тухай",
      subtitle: "Мэргэжлийн сэтгэл зүйн үнэлгээ ба дүн шинжилгээ",
      description: "Психометрийн нь Монгол улс дахь анхдагч мэргэжлийн байгууллага бөгөөд баталгаат, найдвартай, тохирц чанарыг хангаж стандартчилсан сэтгэл зүйн үнэлгээний тестийг хэрэглээнд нэвтрүүлж буй.",
      
      mission: {
        title: "Бидний эрхэм зорилго",
        content: "Шинжлэх ухаанд суурилсан мэргэжлийн дэмжлэг үзүүлж, сэтгэл зүйн үнэлгээний дүн шинжилгээгээр шийдвэр гаргахад тусалж, Монгол улс дахь бүх хүнд чанартай сэтгэл зүйн тестийн боломжийг хүртээмжтэй болгох."
      },
      
      vision: {
        title: "Бидний алсын хараа",
        content: "Монгол улс дахь сэтгэл зүйн үнэлгээний тэргүүлэх платформ болж, сэтгэл санааны эрүүл мэнд болон байгууллагын хөгжлийн хөгжүүлэхэд хувь нэмэр оруулдаг сайн сургагдсан мэргэжлийн хүмүүсийн хамт олонд дэмжлэг үзүүлэх."
      },
      
      features: [
        {
          icon: <BookOpen className="w-6 h-6" />,
          title: "Сэтгэл зүйн үнэлгээ",
          description: "Сэтгэл санааны эрүүл мэнд, бие хүний үнэлгээ, оюун ухааны итгэлцүүр, мэргэжлийн ур чадвар, хандлагын үнэлгээ зэргийг багтаасан дэлгэрэнгүй сэтгэл зүйн үнэлгээ."
        },
        {
          icon: <Users className="w-6 h-6" />,
          title: "Мэргэжлийн зөвлөх үйлчилгээ",
          description: "Стресс менежмент, хүний нөөцийн сонгон шалгаруулалтын үнэлгээ, ажилтны хөгжлийн сургалт зэрэг мэргэжлийн зөвлөх үйлчилгээ."
        },
        {
          icon: <Award className="w-6 h-6" />,
          title: "Стандартчилагдсан тестүүд",
          description: "Манай IQ тест нь Оксфордын их сургуулийн судалгаагаар психометрик тохирц чанарыг хангасан шинжлэх ухааны арга зүй."
        },
        {
          icon: <Globe className="w-6 h-6" />,
          title: "Цахим үнэлгээний төв",
          description: "Дэлхийн хаанаас ч, хэзээ ч үнэлгээ хийлгэх боломжтой талант аналитикийн ухаалаг шийдэл."
        },
        {
          icon: <Target className="w-6 h-6" />,
          title: "Талант таних",
          description: "Байгууллагын капитал болсон талантыг танихад туслаж, дэлгэрэнгүй үнэлгээний хэрэгслээр хөгжүүлэх."
        },
        {
          icon: <Heart className="w-6 h-6" />,
          title: "10+ жилийн туршлага",
          description: "Сэтгэл зүйн тестийн оношилгоонд суурилсан дүгнэлт гаргаж, зөвлөгөө, зөвлөх үйлчилгээ үзүүлж буй 10 жилийн туршлагатай хамт олон."
        }
      ],
      
      stats: {
        title: "Платформын статистик",
        items: [
          { label: "Жилийн туршлага", value: "10+" },
          { label: "Үнэлгээний төрөл", value: "5+" },
          { label: "Хамтрагч байгууллага", value: "50+" },
          { label: "Амжилтын хувь", value: "95%" }
        ]
      },
      
      contact: {
        title: "Бидэнтэй холбогдох",
        content: "Манай сэтгэл зүйн үнэлгээний үйлчилгээтэй холбоотой асуулт байна уу? Бид танд зөв шийдвэр гаргахад тусалахад бэлэн байна.",
        email: "info@psychometrics.mn",
        phone: "+976 7000-7188"
      }
    }
  };

  const content = aboutContent[language as keyof typeof aboutContent];

  return (
    <div className="p-6 max-w-6xl mx-auto h-full overflex-y-scroll">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{content.title}</h1>
        <p className="text-xl text-gray-600 mb-6">{content.subtitle}</p>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
          {content.description}
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">{content.mission.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{content.mission.content}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">{content.vision.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{content.vision.content}</p>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          {language === 'mn' ? 'Бидний онцлогууд' : 'Our Features'}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="text-blue-600 mr-3">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{content.stats.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {content.stats.items.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">{content.contact.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-700 mb-6 leading-relaxed">{content.contact.content}</p>
          <div className="space-y-2">
            <p className="text-gray-600">
              <strong>Email:</strong> {content.contact.email}
            </p>
            <p className="text-gray-600">
              <strong>{language === 'mn' ? 'Утас:' : 'Phone:'}</strong> {content.contact.phone}
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />
      
      <div className="text-center text-gray-600">
        <p>© 2024 TestCenter. {language === 'mn' ? 'Бүх эрх хуулиар хамгаалагдсан.' : 'All rights reserved.'}</p>
      </div>
    </div>
  );
} 