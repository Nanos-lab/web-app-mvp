"use client";

import React, { useState } from "react";
import {
  Calendar,
  Gauge,
  Clock,
  DollarSign,
  Users,
  Thermometer,
  FileText,
  Languages,
  Banknote,
  Globe,
  Plane,
  MapPin,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import type {
  TravelInfo,
  PracticalInfo,
  GettingThere,
} from "@/types/api";

interface TravelInfoPanelProps {
  travelInfo: TravelInfo;
  practical: PracticalInfo;
  gettingThere: GettingThere;
  safetyNotes: string | null;
  funFacts: string[];
  travelTips: string[];
}

type TabId = "info" | "practical" | "transport" | "tips" | "facts";

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: "info", label: "旅行信息", icon: <Calendar size={16} /> },
  { id: "practical", label: "实用指南", icon: <FileText size={16} /> },
  { id: "transport", label: "交通方式", icon: <Plane size={16} /> },
  { id: "tips", label: "旅行贴士", icon: <Lightbulb size={16} /> },
  { id: "facts", label: "冷知识", icon: <CheckCircle2 size={16} /> },
];

const difficultyLabel: Record<string, string> = {
  easy: "轻松",
  moderate: "适中",
  difficult: "较难",
  extreme: "极限",
};
const budgetLabel: Record<string, string> = {
  budget: "经济",
  moderate: "适中",
  luxury: "奢华",
};
const crowdLabel: Record<string, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export function TravelInfoPanel({
  travelInfo,
  practical,
  gettingThere,
  safetyNotes,
  funFacts,
  travelTips,
}: TravelInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("info");

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* 桌面端 Tabs */}
      <div className="hidden lg:flex border-b border-gray-200 bg-gray-50/50">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium
              border-b-2 transition-colors
              ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 移动端 Accordion */}
      <div className="lg:hidden divide-y divide-gray-200">
        {TABS.map((tab) => (
          <details key={tab.id} className="group" open={activeTab === tab.id}>
            <summary
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(activeTab === tab.id ? "info" : tab.id);
              }}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                {tab.icon}
                {tab.label}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  activeTab === tab.id ? "rotate-180" : ""
                }`}
              />
            </summary>
            {activeTab === tab.id && (
              <div className="px-4 pb-4">
                {renderTabContent(tab.id, {
                  travelInfo,
                  practical,
                  gettingThere,
                  safetyNotes,
                  funFacts,
                  travelTips,
                })}
              </div>
            )}
          </details>
        ))}
      </div>

      {/* 桌面端内容 */}
      <div className="hidden lg:block p-6">
        {renderTabContent(activeTab, {
          travelInfo,
          practical,
          gettingThere,
          safetyNotes,
          funFacts,
          travelTips,
        })}
      </div>
    </div>
  );
}

function renderTabContent(
  tabId: TabId,
  props: TravelInfoPanelProps
): React.ReactNode {
  switch (tabId) {
    case "info":
      return <TravelInfoTab travelInfo={props.travelInfo} />;
    case "practical":
      return <PracticalTab practical={props.practical} safetyNotes={props.safetyNotes} />;
    case "transport":
      return <TransportTab gettingThere={props.gettingThere} />;
    case "tips":
      return <TipsTab tips={props.travelTips} />;
    case "facts":
      return <FactsTab facts={props.funFacts} />;
    default:
      return null;
  }
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-gray-400 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function TravelInfoTab({ travelInfo }: { travelInfo: TravelInfo }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <InfoRow icon={<Calendar size={18} />} label="最佳季节" value={travelInfo.best_season} />
      <InfoRow icon={<Gauge size={18} />} label="难度" value={difficultyLabel[travelInfo.difficulty] ?? travelInfo.difficulty} />
      <InfoRow icon={<Clock size={18} />} label="建议停留" value={travelInfo.duration} />
      <InfoRow icon={<DollarSign size={18} />} label="预算" value={budgetLabel[travelInfo.budget] ?? travelInfo.budget} />
      <InfoRow icon={<Users size={18} />} label="拥挤程度" value={crowdLabel[travelInfo.crowd_level] ?? travelInfo.crowd_level} />
      <InfoRow icon={<Thermometer size={18} />} label="温度" value={travelInfo.temperature} />
    </div>
  );
}

function PracticalTab({
  practical,
  safetyNotes,
}: {
  practical: PracticalInfo;
  safetyNotes: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoRow icon={<FileText size={18} />} label="签证" value={practical.visa_info} />
        <InfoRow icon={<Languages size={18} />} label="语言" value={practical.language} />
        <InfoRow icon={<Banknote size={18} />} label="货币" value={practical.currency} />
        <InfoRow icon={<Globe size={18} />} label="时区" value={practical.timezone} />
      </div>

      {safetyNotes && (
        <div className="flex gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-0.5">安全须知</p>
            <p className="text-sm text-amber-700">{safetyNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TransportTab({ gettingThere }: { gettingThere: GettingThere }) {
  return (
    <div className="space-y-4">
      <InfoRow
        icon={<Plane size={18} />}
        label="最近机场"
        value={gettingThere.nearest_airport}
      />
      <div>
        <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
          <MapPin size={16} />
          抵达路线
        </p>
        <ol className="list-decimal list-inside space-y-1.5">
          {gettingThere.routes.map((route, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed">
              {route}
            </li>
          ))}
        </ol>
      </div>
      <InfoRow
        icon={<MapPin size={18} />}
        label="当地交通"
        value={gettingThere.local_transport}
      />
    </div>
  );
}

function TipsTab({ tips }: { tips: string[] }) {
  if (tips.length === 0) {
    return <p className="text-sm text-gray-400">暂无旅行贴士</p>;
  }
  return (
    <ul className="space-y-2.5">
      {tips.map((tip, i) => (
        <li key={i} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
          <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
          <span>{tip}</span>
        </li>
      ))}
    </ul>
  );
}

function FactsTab({ facts }: { facts: string[] }) {
  if (facts.length === 0) {
    return <p className="text-sm text-gray-400">暂无冷知识</p>;
  }
  return (
    <div className="space-y-3">
      {facts.map((fact, i) => (
        <div
          key={i}
          className="p-4 rounded-lg bg-primary-50 border border-primary-100 text-sm text-gray-700 leading-relaxed"
        >
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold mr-2">
            {i + 1}
          </span>
          {fact}
        </div>
      ))}
    </div>
  );
}
