// components/common/StatCard.jsx - Modern Bento Grid Style Stat Card
import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

const StatCard = ({
  title,
  value,
  suffix,
  prefix,
  icon: Icon,
  trend,
  trendValue,
  color = 'indigo',
  size = 'normal',
  className = '',
  onClick,
}) => {
  const colorVariants = {
    indigo: {
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      bg: 'rgba(99, 102, 241, 0.08)',
      iconBg: 'rgba(99, 102, 241, 0.15)',
      shadow: '0 8px 24px rgba(99, 102, 241, 0.15)',
    },
    blue: {
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      bg: 'rgba(59, 130, 246, 0.08)',
      iconBg: 'rgba(59, 130, 246, 0.15)',
      shadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
    },
    green: {
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bg: 'rgba(16, 185, 129, 0.08)',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      shadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
    },
    amber: {
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      bg: 'rgba(245, 158, 11, 0.08)',
      iconBg: 'rgba(245, 158, 11, 0.15)',
      shadow: '0 8px 24px rgba(245, 158, 11, 0.15)',
    },
    rose: {
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
      bg: 'rgba(244, 63, 94, 0.08)',
      iconBg: 'rgba(244, 63, 94, 0.15)',
      shadow: '0 8px 24px rgba(244, 63, 94, 0.15)',
    },
    purple: {
      gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
      bg: 'rgba(168, 85, 247, 0.08)',
      iconBg: 'rgba(168, 85, 247, 0.15)',
      shadow: '0 8px 24px rgba(168, 85, 247, 0.15)',
    },
  };

  const colors = colorVariants[color] || colorVariants.indigo;
  const isLarge = size === 'large';

  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: colors.shadow,
        padding: isLarge ? '32px' : '24px',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
      className={className}
    >
      {/* Decorative gradient background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: colors.gradient,
          opacity: 0.1,
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header with icon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div
            style={{
              width: isLarge ? 56 : 48,
              height: isLarge ? 56 : 48,
              background: colors.iconBg,
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${colors.shadow}`,
            }}
          >
            {Icon && (
              <Icon
                style={{
                  fontSize: isLarge ? 28 : 24,
                  background: colors.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              />
            )}
            {prefix && (
              <span
                style={{
                  fontSize: isLarge ? 28 : 24,
                  background: colors.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {prefix}
              </span>
            )}
          </div>

          {trend && (
            <div
              style={{
                padding: '4px 12px',
                borderRadius: '12px',
                background: trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                border: `1px solid ${trend === 'up' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: trend === 'up' ? '#10b981' : '#f43f5e',
                }}
              >
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </Text>
            </div>
          )}
        </div>

        {/* Value */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              fontSize: isLarge ? 40 : 32,
              fontWeight: 700,
              background: colors.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.2,
            }}
          >
            {value}
            {suffix && (
              <span style={{ fontSize: isLarge ? 24 : 20, fontWeight: 500, marginLeft: 4 }}>
                {suffix}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <Text
          style={{
            fontSize: 14,
            color: '#64748b',
            fontWeight: 500,
            display: 'block',
          }}
        >
          {title}
        </Text>
      </div>
    </div>
  );
};

export default StatCard;

