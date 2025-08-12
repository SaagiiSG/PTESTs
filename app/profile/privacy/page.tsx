"use client";

import { useLanguage } from '@/lib/language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPage() {
  const { t, language } = useLanguage();

  const privacyContent = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: December 2024",
      introduction: "Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.",
      
      sections: [
        {
          title: "Information We Collect",
          content: "We collect information you provide directly to us, such as when you create an account, enroll in courses, or contact us. This may include your name, email address, phone number, and educational background."
        },
        {
          title: "How We Use Your Information",
          content: "We use the information we collect to provide, maintain, and improve our services, process payments, communicate with you, and personalize your learning experience."
        },
        {
          title: "Information Sharing",
          content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or required by law."
        },
        {
          title: "Data Security",
          content: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
        },
        {
          title: "Your Rights",
          content: "You have the right to access, update, or delete your personal information. You can also opt out of certain communications and request data portability."
        },
        {
          title: "Cookies and Tracking",
          content: "We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content."
        },
        {
          title: "Children's Privacy",
          content: "Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13."
        },
        {
          title: "Changes to This Policy",
          content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page."
        },
        {
          title: "Contact Us",
          content: "If you have any questions about this Privacy Policy, please contact us at privacy@testcenter.mn"
        }
      ]
    },
    mn: {
      title: "Нууцлалын бодлого",
      lastUpdated: "Сүүлд шинэчилсэн: 2024 оны 12-р сар",
      introduction: "Таны нууцлал бидэнд чухал. Энэхүү Нууцлалын бодлого нь бид таны хувийн мэдээллийг хэрхэн цуглуулж, ашиглаж, хамгаалдаг талаар тайлбарладаг.",
      
      sections: [
        {
          title: "Бид цуглуулдаг мэдээлэл",
          content: "Бид таны шууд өгсөн мэдээллийг цуглуулдаг, жишээ нь бүртгэл үүсгэх, курсд элсэх, эсвэл бидэнтэй холбогдох үед. Энэ нь таны нэр, имэйл хаяг, утасны дугаар, боловсролын суурь мэдлэгийг багтааж болно."
        },
        {
          title: "Бид таны мэдээллийг хэрхэн ашигладаг",
          content: "Бид цуглуулсан мэдээллийг үйлчилгээгээ хангах, хадгалах, сайжруулах, төлбөр төлөх, танытай холбогдох, сургалтын туршлагыг хувийн болгоход ашигладаг."
        },
        {
          title: "Мэдээлэл хуваалцах",
          content: "Бид таны зөвшөөрөлгүйгээр хувийн мэдээллийг гуравдагч талд зарж, худалдаж, эсвэл шилжүүлдэггүй, энэ бодлогод тайлбарласан эсвэл хуулиар шаардлагатай тохиолдолд л."
        },
        {
          title: "Өгөгдлийн аюулгүй байдал",
          content: "Бид таны хувийн мэдээллийг зөвшөөрөлгүй хандалтаас, өөрчлөлт, илчлэлт, эсвэл устгалтаас хамгаалахын тулд тохирох аюулгүй байдлын арга хэмжээг хэрэгжүүлдэг."
        },
        {
          title: "Таны эрхүүд",
          content: "Таны хувийн мэдээллийг хандах, шинэчлэх, эсвэл устгах эрхтэй. Та мөн тодорхой холбоосуудаас татгалзаж, өгөгдлийн зөөврийн байдлыг хүсэж болно."
        },
        {
          title: "Күүки болон хяналт",
          content: "Бид таны туршлагыг сайжруулах, ашиглалтын загварыг шинжлэх, хувийн агуулгыг хангахын тулд күүки болон төстэй технологиудыг ашигладаг."
        },
        {
          title: "Хүүхдийн нууцлал",
          content: "Бидний үйлчилгээ 13-аас доош насны хүүхдэд зориулагдаагүй. Бид 13-аас доош насны хүүхдээс хувийн мэдээлэл цуглуулдаггүй."
        },
        {
          title: "Энэ бодлогын өөрчлөлтүүд",
          content: "Бид энэхүү Нууцлалын бодлогыг үе үе шинэчилж болно. Бид шинэ бодлогыг энэ хуудсанд нийтлэх замаар өөрчлөлтийн талаар танд мэдэгдэх болно."
        },
        {
          title: "Бидэнтэй холбогдох",
          content: "Хэрэв танд энэхүү Нууцлалын бодлоготой холбоотой асуулт байвал privacy@testcenter.mn хаягаар бидэнтэй холбогдоно уу"
        }
      ]
    }
  };

  const content = privacyContent[language as keyof typeof privacyContent];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{content.title}</h1>
        <p className="text-gray-600">{content.lastUpdated}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            {content.introduction}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {content.sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {section.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-8" />
      
      <div className="text-center text-gray-600">
        <p>© 2024 TestCenter. {language === 'mn' ? 'Бүх эрх хуулиар хамгаалагдсан.' : 'All rights reserved.'}</p>
      </div>
    </div>
  );
} 