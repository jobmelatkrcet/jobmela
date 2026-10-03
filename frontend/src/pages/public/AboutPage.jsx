import React from 'react';
import { Calendar, MapPin, CheckCircle, Award, Target, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="app-container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto 3.5rem' }}>
          <div
            className="badge badge-blue"
            style={{ marginBottom: '1rem', padding: '0.4rem 1rem' }}
          >
            About The Event
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '1.25rem' }}>
            TKRCET Job Mela 2026
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: '1.7' }}>
            A premier employment initiative organized by TKR College of Engineering & Technology
            to connect students from varied academic paths directly with recruiting organizations.
          </p>
        </div>

        {/* Objective & Mission */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}
        >
          <div className="card">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-brand-50)',
                color: 'var(--color-brand-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Event Objective</h3>
            <p style={{ color: 'var(--color-primary-700)', lineHeight: '1.7', fontSize: '0.98rem' }}>
              The primary purpose of TKRCET Job Mela 2026 is to bridge the gap between education
              and professional opportunities. We are dedicated to providing accessible employment
              avenues for students belonging to all eligible educational streams, promoting equal
              opportunity and industry readiness.
            </p>
          </div>

          <div className="card">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-50)',
                color: 'var(--color-success-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Scope &amp; Participation</h3>
            <p style={{ color: 'var(--color-primary-700)', lineHeight: '1.7', fontSize: '0.98rem' }}>
              Expected participation includes <strong>100+ recruiting companies/campuses</strong> and
              up to <strong>10,000 enthusiastic students</strong>. Through this unified digital portal,
              students can view registered companies, submit multiple applications with one click,
              and track their application status seamlessly.
            </p>
          </div>
        </div>

        {/* Education Categories */}
        <div
          className="card"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            marginBottom: '4rem',
          }}
        >
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            Participating Educational Backgrounds
          </h3>
          <div className="grid-4col-responsive">
            {[
              {
                title: 'B.Tech / Engineering',
                detail: 'CSE, IT, ECE, EEE, MECH, CIVIL and emerging branches',
              },
              {
                title: 'Graduation Degrees',
                detail: 'B.Sc, B.Com, BBA, BCA, BA and equivalent degree programs',
              },
              {
                title: 'Polytechnic Diploma',
                detail: '3-Year Polytechnic diploma holders across engineering fields',
              },
              {
                title: '10th & Intermediate',
                detail: 'Eligible candidates seeking early career openings and entry-level positions',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--color-bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckCircle size={18} color="var(--color-brand-600)" />
                  <strong style={{ fontSize: '1rem', color: 'var(--color-primary-900)' }}>
                    {item.title}
                  </strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '3rem 2rem',
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
          }}
        >
          <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '0.75rem' }}>
            Ready to participate in TKRCET Job Mela 2026?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1.75rem' }}>
            Registration is completely free for all eligible students.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Register as Student
            </Link>
            <Link to="/companies" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: '#475569' }}>
              Browse Companies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
