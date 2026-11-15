interface Build {
  buildId: number;
  commitId: string;
  status: string;
  conclusion: string;
  date: string;
}

interface BuildsListProps {
  builds: Build[];
}

export default function BuildsList({ builds }: BuildsListProps) {
  console.log('BuildsList received:', builds);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string, conclusion: string) => {
    if (status === 'completed') {
      if (conclusion === 'success') return '#10b981';
      if (conclusion === 'failure') return '#ef4444';
    }
    if (status === 'in_progress') return '#f59e0b';
    return '#6b7280';
  };

  const getStatusEmoji = (status: string, conclusion: string) => {
    if (status === 'completed') {
      if (conclusion === 'success') return '✅';
      if (conclusion === 'failure') return '❌';
    }
    if (status === 'in_progress') return '⏳';
    return '⚪';
  };

  return (
    <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <thead>
          <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
              Status
            </th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
              Build ID
            </th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
              Commit
            </th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {builds.map((build) => (
            <tr
              key={build.buildId}
              style={{
                borderBottom: '1px solid #f3f4f6',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
              }}
            >
              <td style={{ padding: '0.75rem 1rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  background: `${getStatusColor(build.status, build.conclusion)}15`,
                  color: getStatusColor(build.status, build.conclusion),
                }}>
                  {getStatusEmoji(build.status, build.conclusion)}
                  {build.conclusion || build.status || 'Unknown'}
                </span>
              </td>
              <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {build.buildId || 'N/A'}
              </td>
              <td style={{ padding: '0.75rem 1rem' }}>
                {build.commitId ? (
                  <code style={{
                    background: '#f3f4f6',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    color: '#1f2937',
                  }}>
                    {build.commitId.substring(0, 7)}
                  </code>
                ) : (
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>N/A</span>
                )}
              </td>
              <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {formatDate(build.date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {builds.length === 0 && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#9ca3af',
          background: '#f9fafb',
          borderRadius: '8px',
        }}>
          No builds found
        </div>
      )}
    </div>
  );
}
