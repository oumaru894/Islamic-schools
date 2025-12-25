import React from 'react';
import Button from './Button';

export interface HeroCTA {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface HeroProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  backgroundImage?: string;
  logo?: string;
  heightClass?: string; // e.g. 'h-64 md:h-96'
  overlayColor?: string; // tailwind or rgba string
  ctas?: HeroCTA[];
  children?: React.ReactNode;
}

const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  description,
  backgroundImage,
  logo,
  heightClass = 'h-72 md:h-96',
  overlayColor = 'rgba(2,6,23,0.6)',
  ctas = [],
  children
}) => {
  return (
    <section className={`relative overflow-hidden ${heightClass} w-full`} aria-label="Hero">
      {backgroundImage ? (
        <img src={backgroundImage} alt="Hero background" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-600" />
      )}

      <div className="absolute inset-0" style={{ background: overlayColor }} aria-hidden />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="w-full text-center">
          {logo && (
            <div className="mx-auto mb-4 w-20 h-20 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
              <img src={logo} alt="logo" className="w-full h-full object-contain p-2" />
            </div>
          )}

          <div className="text-white">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">{title}</h1>
              {subtitle && <p className="mt-2 text-lg md:text-xl text-emerald-100">{subtitle}</p>}
              {description && <p className="mt-4 text-sm md:text-base text-emerald-200 leading-relaxed">{description}</p>}

              {ctas.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  {ctas.map((cta, i) => (
                    <span key={i}>
                      {cta.href ? (
                        <a href={cta.href} rel="noopener" className="inline-block">
                          <Button size="lg" variant={cta.variant as any}>{cta.label}</Button>
                        </a>
                      ) : (
                        <Button size="lg" variant={cta.variant as any} onClick={cta.onClick}>{cta.label}</Button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
