import React from "react";
import { UserPlanTier } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import { HeroProteinShowcase } from "./HeroProteinShowcase";
import { WhyChooseUsSection } from "./WhyChooseUsSection";
import {
  Brain,
  Bone,
  Smile,
  Stethoscope,
  Clock,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Database,
  Server,
  Cpu,
  Dna,
  Rocket,
  DollarSign,
  Globe,
  Layers,
  Zap,
  Crown,
  ArrowRight,
  Eye,
  HeartPulse,
  ShieldAlert,
  Sparkle,
  Activity,
} from "lucide-react";

interface AboutServiceOverviewProps {
  onNavigateDepartment: (cat: any) => void;
  onOpenCheckout: (tier: UserPlanTier) => void;
  onOpenPlanDetails?: () => void;
}

export const AboutServiceOverview: React.FC<AboutServiceOverviewProps> = ({
  onNavigateDepartment,
  onOpenCheckout,
  onOpenPlanDetails,
}) => {
  const { t } = useLanguage();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "40px",
        color: "#dae2fd",
      }}
    >
      {/* Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "44px 48px",
          border: "1px solid rgba(76, 215, 246, 0.4)",
          borderRadius: "28px",
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(11, 19, 38, 0.98) 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          gap: "32px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "relative",
            zIndex: 10,
            flex: "1 1 560px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 24px 9px 22px",
              marginLeft: "16px",
              borderRadius: "20px",
              background: "rgba(76, 215, 246, 0.15)",
              border: "1px solid rgba(76, 215, 246, 0.5)",
              color: "#4cd7f6",
              fontSize: "0.88rem",
              fontWeight: 800,
              marginBottom: "20px",
            }}
          >
            <Sparkles size={16} />{" "}
            {t("hero.badge", "AI 파이프라인 x 38+ 생의학 라이브 빅데이터 스킬")}
          </div>

          <h2
            style={{
              fontSize: "2.8rem",
              fontWeight: 900,
              color: "#ffffff",
              margin: 0,
              lineHeight: "1.25",
              letterSpacing: "-0.02em",
              marginLeft: "16px",
            }}
          >
            {t("hero.title", "전신 10대 의학과 종합 AI 표적분자 스캐닝 포털")}{" "}
            <br />
            <span
              style={{
                color: "#4cd7f6",
                background: "rgba(76, 215, 246, 0.12)",
                padding: "2px 12px",
                borderRadius: "10px",
              }}
            >
              AI Medical Target Scanning
            </span>
          </h2>

          <p
            style={{
              color: "#dae2fd",
              fontSize: "1.05rem",
              marginTop: "16px",
              lineHeight: "1.75",
              marginLeft: "16px",
            }}
          >
            {t(
              "hero.desc",
              "Aetheria Bio는 신경외과, 신경과, 정형외과, 정신건강의학과, 순환기내과, 종양내과, 내분비내과, 류마티스내과, 피부과, 안과에 이르는 전신 10대 의학 분야의 단백질 3D 구조(AlphaFold), 질환 연관도(OpenTargets), 분자 결합력(ChEMBL), FTO 특허 판단을 38개 라이브 생의학 스킬과 함께 PubMed(3,500만+ 논문), OpenAlex(2억 5천만+ 학술 자료), AlphaFold DB(2억+ 3D 단백질 구조), ClinicalTrials(45만+ 임상 데이터) 등 인류 최대의 생의학/임상 빅데이터 API 라이브 엔진으로 통합 제공합니다.",
            )}
          </p>

          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "28px",
              flexWrap: "wrap",
              marginLeft: "16px",
            }}
          >
            <button
              onClick={() => onNavigateDepartment("neurosurgery")}
              style={{
                padding: "14px 32px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #4cd7f6 0%, #1bbd85 100%)",
                color: "#000",
                fontWeight: 900,
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 20px rgba(76, 215, 246, 0.25)",
              }}
            >
              {t("hero.btn_run", "10대 의학과 포털 체험하기")}{" "}
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => onOpenCheckout("pro")}
              style={{
                padding: "14px 28px",
                borderRadius: "14px",
                border: "1px solid rgba(208, 188, 255, 0.5)",
                background: "rgba(208, 188, 255, 0.15)",
                color: "#d0bcff",
                fontWeight: 800,
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Zap size={18} /> Pro {t("auth.checkout_title", "구독")} ($490
              {t("plan.per_month", "/월")})
            </button>

            {onOpenPlanDetails && (
              <button
                onClick={onOpenPlanDetails}
                style={{
                  padding: "14px 24px",
                  borderRadius: "14px",
                  border: "1px solid rgba(76, 215, 246, 0.5)",
                  background: "rgba(76, 215, 246, 0.12)",
                  color: "#4cd7f6",
                  fontWeight: 800,
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Sparkles size={18} />{" "}
                {t("pmodal.title", "요금제별 제공 서비스 및 혜택 상세 안내")}
              </button>
            )}
          </div>
        </div>

        <HeroProteinShowcase />
      </div>

      {/* 10 Medical Specialties Grid */}
      <div>
        <h3
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            color: "#fff",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Layers color="#4cd7f6" size={24} />{" "}
          {t("overview.grid_title", "사이언스 스킬 지원 전신 10대 전문 의학과")}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            onClick={() => onNavigateDepartment("neurosurgery")}
            style={{
              padding: "20px",
              background: "rgba(23, 31, 51, 0.85)",
              borderRadius: "16px",
              border: "1px solid rgba(76, 215, 246, 0.3)",
              cursor: "pointer",
            }}
          >
            <Brain size={24} color="#4cd7f6" />
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#fff",
                margin: "10px 0 4px 0",
              }}
            >
              {t("dept.neurosurgery", "1. 신경외과")}
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#bcc9cd", margin: 0 }}>
              {t(
                "overview.card_neurosurgery_desc",
                "알츠하이머 Tau 단백질 & 뇌수술 표적 3D 분석",
              )}
            </p>
          </div>

          <div
            onClick={() => onNavigateDepartment("neurology")}
            style={{
              padding: "20px",
              background: "rgba(23, 31, 51, 0.85)",
              borderRadius: "16px",
              border: "1px solid rgba(78, 222, 163, 0.3)",
              cursor: "pointer",
            }}
          >
            <Activity size={24} color="#4edea3" />
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#fff",
                margin: "10px 0 4px 0",
              }}
            >
              {t("dept.neurology", "2. 신경과")}
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#bcc9cd", margin: 0 }}>
              {t(
                "overview.card_neurology_desc",
                "파킨슨병 SNCA 루이소체 독성 억제 표적",
              )}
            </p>
          </div>

          <div
            onClick={() => onNavigateDepartment("orthopedics")}
            style={{
              padding: "20px",
              background: "rgba(23, 31, 51, 0.85)",
              borderRadius: "16px",
              border: "1px solid rgba(208, 188, 255, 0.3)",
              cursor: "pointer",
            }}
          >
            <Bone size={24} color="#d0bcff" />
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#fff",
                margin: "10px 0 4px 0",
              }}
            >
              {t("dept.orthopedics", "3. 정형외과")}
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#bcc9cd", margin: 0 }}>
              {t(
                "overview.card_orthopedics_desc",
                "퇴행성 관절염 MMP13 연골 및 BMP2 뼈 재생",
              )}
            </p>
          </div>

          <div
            onClick={() => onNavigateDepartment("psychiatry")}
            style={{
              padding: "20px",
              background: "rgba(23, 31, 51, 0.85)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 215, 0, 0.3)",
              cursor: "pointer",
            }}
          >
            <Smile size={24} color="#ffd700" />
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#fff",
                margin: "10px 0 4px 0",
              }}
            >
              {t("dept.psychiatry", "4. 정신건강의학과")}
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#bcc9cd", margin: 0 }}>
              {t(
                "overview.card_psychiatry_desc",
                "세로토닌 HTR2A & 난치성 우울증 NMDA",
              )}
            </p>
          </div>

          <div
            onClick={() => onNavigateDepartment("cardiology")}
            style={{
              padding: "20px",
              background: "rgba(23, 31, 51, 0.85)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 99, 132, 0.3)",
              cursor: "pointer",
            }}
          >
            <HeartPulse size={24} color="#ff6b81" />
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#fff",
                margin: "10px 0 4px 0",
              }}
            >
              {t("dept.cardiology", "5. 순환기내과")}
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#bcc9cd", margin: 0 }}>
              {t(
                "overview.card_cardiology_desc",
                "동맥경화 PCSK9 콜레스테롤 제거 표적",
              )}
            </p>
          </div>

          <div
            onClick={() => onNavigateDepartment("oncology")}
            style={{
              padding: "20px",
              background: "rgba(23, 31, 51, 0.85)",
              borderRadius: "16px",
              border: "1px solid rgba(76, 215, 246, 0.3)",
              cursor: "pointer",
            }}
          >
            <Stethoscope size={24} color="#4cd7f6" />
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#fff",
                margin: "10px 0 4px 0",
              }}
            >
              {t("dept.oncology", "6. 종양내과")}
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#bcc9cd", margin: 0 }}>
              {t(
                "overview.card_oncology_desc",
                "PD-L1 면역항암 블록버스터 표적 스캐닝",
              )}
            </p>
          </div>

          <div
            onClick={() => onNavigateDepartment("endocrinology")}
            style={{
              padding: "20px",
              background: "rgba(23, 31, 51, 0.85)",
              borderRadius: "16px",
              border: "1px solid rgba(78, 222, 163, 0.3)",
              cursor: "pointer",
            }}
          >
            <Dna size={24} color="#4edea3" />
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#fff",
                margin: "10px 0 4px 0",
              }}
            >
              {t("dept.endocrinology", "7. 내분비내과")}
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#bcc9cd", margin: 0 }}>
              {t(
                "overview.card_endocrinology_desc",
                "GLP-1R 당뇨/비만/대사질환 수용체 표적",
              )}
            </p>
          </div>

          <div
            onClick={() => onNavigateDepartment("immunology")}
            style={{
              padding: "20px",
              background: "rgba(23, 31, 51, 0.85)",
              borderRadius: "16px",
              border: "1px solid rgba(208, 188, 255, 0.3)",
              cursor: "pointer",
            }}
          >
            <ShieldCheck size={24} color="#d0bcff" />
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#fff",
                margin: "10px 0 4px 0",
              }}
            >
              {t("dept.immunology", "8. 류마티스/면역내과")}
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#bcc9cd", margin: 0 }}>
              {t(
                "overview.card_immunology_desc",
                "TNF-Alpha 류마티스 자가면역 염증 차단",
              )}
            </p>
          </div>

          <div
            onClick={() => onNavigateDepartment("dermatology")}
            style={{
              padding: "20px",
              background: "rgba(23, 31, 51, 0.85)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 215, 0, 0.3)",
              cursor: "pointer",
            }}
          >
            <Sparkles size={24} color="#ffd700" />
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#fff",
                margin: "10px 0 4px 0",
              }}
            >
              {t("dept.dermatology", "9. 피부과")}
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#bcc9cd", margin: 0 }}>
              {t(
                "overview.card_dermatology_desc",
                "COL1A1 피부 콜라겐 합성 & 자외선 손상 복구",
              )}
            </p>
          </div>

          <div
            onClick={() => onNavigateDepartment("ophthalmology")}
            style={{
              padding: "20px",
              background: "rgba(23, 31, 51, 0.85)",
              borderRadius: "16px",
              border: "1px solid rgba(76, 215, 246, 0.3)",
              cursor: "pointer",
            }}
          >
            <Eye size={24} color="#4cd7f6" />
            <h4
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "#fff",
                margin: "10px 0 4px 0",
              }}
            >
              {t("dept.ophthalmology", "10. 안과")}
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#bcc9cd", margin: 0 }}>
              {t(
                "overview.card_ophthalmology_desc",
                "황반변성 VEGFA 안구 신생혈관 억제 표적",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <WhyChooseUsSection onOpenPricingModal={onOpenPlanDetails} />
    </div>
  );
};
