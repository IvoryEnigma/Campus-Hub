import React, { useState } from 'react';
import { X, Lightbulb } from 'lucide-react';
import { api } from '../api';

export default function NewIdeaModal({ isOpen, onClose, onIdeaCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Defense Tech');
  const [tagsInput, setTagsInput] = useState('ROS2, Jetson, AI');
  const [seekingTeammates, setSeekingTeammates] = useState(true);
  const [neededSkillsInput, setNeededSkillsInput] = useState('Embedded C++, PyTorch');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const neededSkills = neededSkillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.createIdea({
        title,
        description,
        category,
        tags,
        seekingTeammates,
        neededSkills,
      });

      onIdeaCreated();
      onClose();
      setTitle('');
      setDescription('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lightbulb size={20} color="var(--color-primary)" />
            <h2>Submit Student Innovation Proposal</h2>
          </div>
          <button className="btn btn-sm btn-outline" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Project / Idea Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Autonomous Campus Navigation using LiDAR & Jetson"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Technology Domain / Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Defense Tech">Defense Tech</option>
                <option value="CleanTech">CleanTech</option>
                <option value="Healthcare & AI">Healthcare & AI</option>
                <option value="Robotics & Autonomous Systems">Robotics & Autonomous Systems</option>
                <option value="CyberSecurity & Cryptography">CyberSecurity & Cryptography</option>
                <option value="General Innovation">General Innovation</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Problem Statement & Solution *</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="What campus or real-world problem does this address? What is the hardware/software approach?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Relevant Tags (Comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ROS2, Edge AI, ESP32, React"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={seekingTeammates}
                  onChange={(e) => setSeekingTeammates(e.target.checked)}
                />
                <span>Actively Seeking Interdisciplinary Teammates</span>
              </label>

              {seekingTeammates && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>
                    Required Technical Skills / Disciplines
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. PCB Design, Firmware, Mobile App, 3D CAD"
                    value={neededSkillsInput}
                    onChange={(e) => setNeededSkillsInput(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
