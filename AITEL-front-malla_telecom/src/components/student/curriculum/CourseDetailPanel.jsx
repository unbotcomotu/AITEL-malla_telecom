import React, { useState, useMemo, useEffect } from 'react';
import PrerequisitesPanel from './PrerequisitesPanel.jsx';
import DifficultyMeter from './DifficultyMeter.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { RatingsApi } from '../../../services/student/ratingsApi.js';
import { CommentsApi } from '../../../services/student/commentsApi.js';
import { DifficultyApi } from '../../../services/student/difficultyApi.js';
import { CourseScheduleApi } from '../../../services/student/courseScheduleApi.js';

const CARD = 'mb-6 rounded-xl bg-surface-2 p-4';
const CARD_TITLE = 'm-0 mb-3 text-base font-semibold text-ink';
const SELECT_CLASS = 'w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink outline-none focus:border-accent';

const CourseDetailPanel = ({
  course,
  onClose,
  isOpen,
  courseGrades,
  curriculumData,
}) => {
  const { user } = useAuth();
  const currentUserId = user?.id;

  const [selectedCycle, setSelectedCycle] = useState('Todos');
  const [selectedSchedule, setSelectedSchedule] = useState('general');
  const [sortBy, setSortBy] = useState('recent');

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [expandedComments, setExpandedComments] = useState(new Set());

  const [ratingSummary, setRatingSummary] = useState(null);
  const [myRating, setMyRating] = useState(0);
  const [difficultySummary, setDifficultySummary] = useState(null);
  // 0 = sin limite. Solo aplica cuando no se fijo un ciclo concreto.
  const [lastSemesters, setLastSemesters] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [cycleData, setCycleData] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const userCourseInfo = courseGrades[course?.id] ? {
    grade: courseGrades[course?.id],
  } : null;

  const availableSchedules = useMemo(() => {
    if (cycleData && cycleData[selectedCycle] && cycleData[selectedCycle].schedules) {
      return Object.entries(cycleData[selectedCycle].schedules).map(([key, data]) => ({
        key,
        ...data
      }));
    }
    return [];
  }, [selectedCycle, cycleData]);

  const currentScheduleData = useMemo(() => {
    if (cycleData && cycleData[selectedCycle] && cycleData[selectedCycle].schedules) {
      return cycleData[selectedCycle].schedules[selectedSchedule];
    }
    return cycleData?.['Todos']?.schedules?.general || {};
  }, [selectedCycle, selectedSchedule, cycleData]);

  useEffect(() => {
    if (course && isOpen) {
      loadComments();
      loadRatingSummary();
      loadDifficultySummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCycle, selectedSchedule, sortBy, lastSemesters, course, isOpen]);

  const loadComments = async () => {
    setCommentsLoading(true);
    setError(null);

    try {
      const data = await CommentsApi.getComments(course.id, selectedCycle, selectedSchedule, lastSemesters);

      let sortedComments = [...data];
      if (sortBy === 'top_rated') {
        sortedComments.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
      } else {
        sortedComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }

      setComments(sortedComments);
    } catch (err) {
      setError(`Error al cargar comentarios: ${err.message}`);
    } finally {
      setCommentsLoading(false);
    }
  };

  const loadRatingSummary = async () => {
    try {
      const summary = await RatingsApi.getSummary(course.id, selectedCycle);
      setRatingSummary(summary);
    } catch (err) {
      console.error('Error al cargar la calificación:', err);
    }
  };

  const loadDifficultySummary = async () => {
    try {
      const summary = await DifficultyApi.getSummary(course.id, {
        cycle: selectedCycle,
        scheduleId: selectedSchedule,
        lastSemesters
      });
      setDifficultySummary(summary);
    } catch (err) {
      console.error('Error al cargar la dificultad:', err);
    }
  };

  const handleDifficultyRate = async (rating) => {
    if (!canInteract) return;
    setLoading(true);
    setError(null);

    try {
      const summary = await DifficultyApi.rate(course.id, {
        cycle: selectedCycle,
        scheduleId: selectedSchedule,
        rating
      });
      setDifficultySummary(summary);
    } catch (err) {
      setError(`Error al calificar la dificultad: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (availableSchedules.length > 0) {
      setSelectedSchedule(availableSchedules[0].key);
    }
  }, [availableSchedules]);

  const handleLike = async (commentId, replyId = null) => {
    setLoading(true);
    setError(null);

    try {
      const updatedData = await CommentsApi.toggleLike(course.id, commentId, replyId);

      setComments(prevComments => prevComments.map(comment => {
        if (comment.id === commentId) {
          if (replyId) {
            return {
              ...comment,
              replies: comment.replies.map(reply => (reply.id === replyId ? updatedData : reply))
            };
          }
          return updatedData;
        }
        return comment;
      }));
    } catch (err) {
      setError(`Error al dar like: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (course && isOpen) {
      loadScheduleData();
    }
  }, [course, isOpen]);

  const loadScheduleData = async () => {
    setScheduleLoading(true);
    setError(null);

    try {
      const data = await CourseScheduleApi.getCourseScheduleInfo(course.id);
      setCycleData(data);
    } catch (err) {
      setError(`Error al cargar horarios: ${err.message}`);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleDislike = async (commentId, replyId = null) => {
    setLoading(true);
    setError(null);

    try {
      const updatedData = await CommentsApi.toggleDislike(course.id, commentId, replyId);

      setComments(prevComments => prevComments.map(comment => {
        if (comment.id === commentId) {
          if (replyId) {
            return {
              ...comment,
              replies: comment.replies.map(reply => (reply.id === replyId ? updatedData : reply))
            };
          }
          return updatedData;
        }
        return comment;
      }));
    } catch (err) {
      setError(`Error al dar dislike: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatContent = (content) => content;

  const canInteract = course?.status === 'approved';

  const handleAddComment = async () => {
    if (newComment.trim() && canInteract) {
      setLoading(true);
      setError(null);

      try {
        const newCommentData = await CommentsApi.createComment(
          course.id, selectedCycle, selectedSchedule, { content: newComment }
        );

        setComments([newCommentData, ...comments]);
        setNewComment('');
      } catch (err) {
        setError(`Error al publicar comentario: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddReply = async (commentId) => {
    if (newReply.trim() && canInteract) {
      setLoading(true);
      setError(null);

      try {
        const newReplyData = await CommentsApi.createReply(course.id, commentId, { content: newReply });

        setComments(comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, replies: [...(comment.replies || []), newReplyData] };
          }
          return comment;
        }));

        setNewReply('');
        setReplyingTo(null);
      } catch (err) {
        setError(`Error al publicar respuesta: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReply = (targetData, isReplyToReply = false) => {
    const commentId = targetData.commentId || targetData.id;
    setReplyingTo({
      commentId,
      author: targetData.author,
      content: targetData.content,
      isReply: isReplyToReply,
      replyId: isReplyToReply ? targetData.id : null
    });

    setNewReply('');
    setExpandedComments(prev => new Set([...prev, commentId]));

    setTimeout(() => {
      const replyArea = document.getElementById(`reply-area-${commentId}`);
      if (replyArea) {
        replyArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        replyArea.focus();
      }
    }, 100);
  };

  const toggleCommentExpansion = (commentId) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const handleReport = async (commentId, replyId = null) => {
    const reason = window.prompt('¿Por qué reportas este contenido?');
    if (!reason) return;

    setLoading(true);
    setError(null);

    try {
      await CommentsApi.reportComment(course.id, commentId, replyId, reason);
      alert('Reporte enviado exitosamente');
    } catch (err) {
      setError(`Error al reportar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = async (rating) => {
    if (!canInteract) return;
    setLoading(true);
    setError(null);

    try {
      const summary = await RatingsApi.rateCourse(course.id, selectedCycle, selectedSchedule, rating);
      setMyRating(rating);
      setRatingSummary(summary);
    } catch (err) {
      setError(`Error al calificar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const likeBtnClass = (active) =>
    `flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
      active ? 'font-semibold text-good' : 'text-muted'
    } ${canInteract && !loading ? 'cursor-pointer hover:bg-bg' : 'cursor-not-allowed opacity-60'}`;

  const dislikeBtnClass = (active) =>
    `flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
      active ? 'font-semibold text-bad' : 'text-muted'
    } ${canInteract && !loading ? 'cursor-pointer hover:bg-bg' : 'cursor-not-allowed opacity-60'}`;

  const renderReply = (reply, commentId) => (
    <div key={reply.id} className="ml-5 mt-3 rounded-lg border-l-2 border-accent bg-bg p-3">
      {reply.replyTo && (
        <div className="mb-2 flex items-start gap-2 rounded-md border-l-2 border-accent bg-accent/10 px-2.5 py-1.5 text-[11px]">
          <div className="min-w-fit font-semibold text-accent">💬 {reply.replyTo.author}:</div>
          <div className="italic leading-tight opacity-90">"{truncateText(reply.replyTo.content, 60)}"</div>
        </div>
      )}

      <div className="mb-2 flex items-start justify-between">
        <span className="text-[13px] font-semibold text-accent">{reply.author}</span>
        <span className="text-[11px] text-muted">{new Date(reply.timestamp).toLocaleString()}</span>
      </div>

      <p className="m-0 mb-2 break-words text-[13px] leading-snug text-ink">{formatContent(reply.content)}</p>

      <div className="flex items-center gap-3 text-[11px]">
        <button onClick={() => handleLike(commentId, reply.id)} disabled={!canInteract} className={likeBtnClass(reply.likedBy?.includes(currentUserId))}>
          👍 {reply.likes}
        </button>
        <button onClick={() => handleDislike(commentId, reply.id)} disabled={!canInteract} className={dislikeBtnClass(reply.dislikedBy?.includes(currentUserId))}>
          👎 {reply.dislikes}
        </button>
        {canInteract && (
          <button
            onClick={() => handleReply({ commentId, author: reply.author, content: reply.content }, true)}
            className="rounded-md px-2 py-1 text-muted hover:bg-bg"
          >
            💬 Responder
          </button>
        )}
        <button onClick={() => handleReport(commentId, reply.id)} className="rounded-md px-2 py-1 text-muted hover:bg-bg">
          🚩
        </button>
      </div>
    </div>
  );

  const renderComment = (comment) => {
    const isExpanded = expandedComments.has(comment.id);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isReplying = replyingTo?.commentId === comment.id;

    return (
      <div key={comment.id} className="mb-5">
        <div className="rounded-xl border border-line bg-bg p-4">
          <div className="mb-2 flex items-start justify-between">
            <span className="text-sm font-semibold text-accent">{comment.author}</span>
            <span className="text-xs text-muted">{new Date(comment.timestamp).toLocaleString()}</span>
          </div>

          <p className="m-0 mb-3 break-words text-sm leading-relaxed text-ink">{formatContent(comment.content)}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button onClick={() => handleLike(comment.id)} disabled={!canInteract || loading} className={likeBtnClass(comment.likedBy?.includes(currentUserId))}>
              👍 {comment.likes}
            </button>
            <button onClick={() => handleDislike(comment.id)} disabled={!canInteract || loading} className={dislikeBtnClass(comment.dislikedBy?.includes(currentUserId))}>
              👎 {comment.dislikes}
            </button>

            {canInteract && (
              <button
                onClick={() => handleReply({ id: comment.id, author: comment.author, content: comment.content }, false)}
                disabled={loading}
                className="rounded-md px-2 py-1 text-muted hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                💬 Responder
              </button>
            )}

            {hasReplies && (
              <button onClick={() => toggleCommentExpansion(comment.id)} className="rounded-md px-2 py-1 font-semibold text-accent hover:bg-accent/10">
                {isExpanded ? '▼' : '▶'} {comment.replies.length} respuesta{comment.replies.length !== 1 ? 's' : ''}
              </button>
            )}

            <button onClick={() => handleReport(comment.id)} disabled={loading} className="rounded-md px-2 py-1 text-muted hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60">
              🚩 Reportar
            </button>
          </div>
        </div>

        {isExpanded && hasReplies && (
          <div className="mt-2">{comment.replies.map(reply => renderReply(reply, comment.id))}</div>
        )}

        {isReplying && (
          <div className="mt-3 rounded-lg border border-accent/30 bg-accent/10 p-3">
            <div className="mb-3 rounded-md border-l-[3px] border-accent bg-accent/15 px-3 py-2">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-accent">
                <span>💬</span><span>Respondiendo a {replyingTo.author}:</span>
              </div>
              <div className="text-[11px] italic leading-tight text-accent/80">
                "{truncateText(replyingTo.content, 80)}"
              </div>
            </div>

            <textarea
              id={`reply-area-${comment.id}`}
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Escribe tu respuesta..."
              className="min-h-[60px] w-full resize-y rounded-md border border-line bg-bg px-3 py-2 text-[13px] text-ink outline-none focus:border-accent"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => { setReplyingTo(null); setNewReply(''); }}
                className="rounded-md border border-line px-3 py-1.5 text-xs text-muted hover:bg-bg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleAddReply(comment.id)}
                disabled={!newReply.trim()}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold text-ink-on-accent ${newReply.trim() ? 'bg-accent' : 'cursor-not-allowed bg-muted'}`}
              >
                Responder
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen || !course) return null;

  const statusBadge = {
    approved: { label: '✓ Aprobado', className: 'bg-good text-ink-on-accent' },
    available: { label: '○ Disponible', className: 'bg-accent text-ink-on-accent' },
    in_progress: { label: '◐ En progreso', className: 'bg-warn text-ink-on-accent' },
  }[course.status] || { label: '🔒 Requiere prerrequisitos', className: 'bg-muted text-ink-on-accent' };

  return (
    <div className="fixed inset-0 z-[1000] flex items-stretch bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="ml-auto h-screen w-full max-w-[500px] overflow-y-auto border-l border-line bg-surface p-6 text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="m-0 mb-1 font-display text-2xl font-bold">{course.label}</h2>
            <p className="m-0 text-sm text-muted">Ciclo {course.cycle} • {course.credits} créditos</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-2xl text-muted transition-colors hover:text-ink"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-bad/40 bg-bad/10 px-3 py-3 text-[13px] text-bad">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="text-base text-bad">✕</button>
          </div>
        )}

        {/* Selector de Ciclo y Horario */}
        {scheduleLoading ? (
          <div className="p-4 text-center text-muted">
            <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-line border-t-accent" />
            Cargando horarios...
          </div>
        ) : cycleData && (
          <div className={CARD}>
            <h3 className={CARD_TITLE}>📅 Ciclo y Horario</h3>

            <div className={availableSchedules.length > 1 ? 'mb-3' : ''}>
              <label className="mb-1.5 block text-sm text-muted">Ciclo Académico</label>
              <select value={selectedCycle} onChange={(e) => setSelectedCycle(e.target.value)} className={SELECT_CLASS}>
                {Object.keys(cycleData).map(cycle => (
                  <option key={cycle} value={cycle}>{cycle === 'Todos' ? 'Todos los ciclos' : cycle}</option>
                ))}
              </select>
            </div>

            {availableSchedules.length > 1 && (
              <div className="mb-3">
                <label className="mb-1.5 block text-sm text-muted">Horario</label>
                <select value={selectedSchedule} onChange={(e) => setSelectedSchedule(e.target.value)} className={SELECT_CLASS}>
                  {availableSchedules.map((schedule, index) => (
                    <option key={schedule.key} value={schedule.key}>Horario {index + 1}: {schedule.schedule}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Solo tiene sentido cuando no se fijo un ciclo concreto: si ya
                elegiste "2025-2", acotar a los ultimos N no cambia nada. */}
            {selectedCycle === 'Todos' && (
              <div>
                <label className="mb-1.5 block text-sm text-muted">Antigüedad</label>
                <select
                  value={lastSemesters}
                  onChange={(e) => setLastSemesters(Number(e.target.value))}
                  className={SELECT_CLASS}
                >
                  <option value={0}>Todos los semestres</option>
                  <option value={1}>Último semestre</option>
                  <option value={2}>Últimos 2 semestres</option>
                  <option value={3}>Últimos 3 semestres</option>
                  <option value={5}>Últimos 5 semestres</option>
                  <option value={10}>Últimos 10 semestres</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Estado del curso */}
        <div className="mb-6">
          <div className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${statusBadge.className}`}>
            {statusBadge.label}
          </div>

          {userCourseInfo && (
            <div className="mt-3 rounded-xl border border-good/30 bg-good/10 p-3">
              <div className="mb-1.5 text-xs font-semibold text-good">📊 Tu información del curso:</div>
              <div className="text-[13px] leading-relaxed text-good/90">
                <div><strong>Nota:</strong> {userCourseInfo.grade}/20</div>
              </div>
            </div>
          )}

          {!canInteract && (
            <p className="mt-2 text-xs text-warn">⚠️ Solo lectura - Aprueba el curso para interactuar</p>
          )}
        </div>

        {/* Prerrequisitos */}
        <PrerequisitesPanel
          course={course}
          courseGrades={courseGrades}
          edges={curriculumData?.edges || []}
          nodes={curriculumData?.nodes || []}
          prerequisiteTypes={curriculumData?.prerequisiteTypes || {}}
        />

        {/* Info del horario */}
        {currentScheduleData && Object.keys(currentScheduleData).length > 0 && (
          <div className={CARD}>
            <h3 className={CARD_TITLE}>👨‍🏫 Información del Horario</h3>
            <div className="flex flex-col gap-2 text-sm">
              {currentScheduleData.professors && (
                <div className="flex items-center gap-2">
                  <span className="text-muted">👨‍🏫 Profesor{currentScheduleData.professors.length > 1 ? 'es' : ''}:</span>
                  <span className="text-ink">{currentScheduleData.professors.join(', ')}</span>
                </div>
              )}
              {currentScheduleData.classroom && (
                <div className="flex items-center gap-2">
                  <span className="text-muted">📍 Aula:</span>
                  <span className="text-ink">{currentScheduleData.classroom}</span>
                </div>
              )}
              {currentScheduleData.schedule && (
                <div className="flex items-center gap-2">
                  <span className="text-muted">🕐 Horario:</span>
                  <span className="text-ink">{currentScheduleData.schedule}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Descripción */}
        <div className={CARD}>
          <h3 className={CARD_TITLE}>📚 Descripción del Curso</h3>
          <p className="m-0 text-sm leading-relaxed text-ink">
            Este curso proporciona una introducción completa a los conceptos fundamentales de {course.label.toLowerCase()}.
            Los estudiantes desarrollarán habilidades prácticas y teóricas necesarias para
            el siguiente nivel de su formación académica en Ingeniería de las Telecomunicaciones.
          </p>
        </div>

        {/* Calificación */}
        <div className={CARD}>
          <h3 className={CARD_TITLE}>⭐ Calificación del Curso</h3>
          <div className="mb-3 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                onClick={() => handleRatingClick(star)}
                className={`text-xl ${canInteract ? 'cursor-pointer' : 'cursor-default'} ${
                  star <= Math.round(ratingSummary?.average || 0) ? 'text-warn' : 'text-line'
                }`}
              >
                {star <= Math.round(ratingSummary?.average || 0) ? '★' : '☆'}
              </span>
            ))}
            <span className="ml-2 text-sm text-muted">
              ({(ratingSummary?.average || 0).toFixed(1)}/5.0 - {ratingSummary?.count || 0} valoraciones)
            </span>
          </div>
          {canInteract && myRating > 0 && (
            <div className="text-xs text-accent">Tu calificación: {myRating}/5 ⭐</div>
          )}
        </div>

        {/* Dificultad: medidor aparte de la calificacion por estrellas */}
        <DifficultyMeter
          summary={difficultySummary}
          canInteract={canInteract}
          loading={loading}
          onRate={handleDifficultyRate}
        />

        {/* Foro de Comentarios */}
        <div className={CARD}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className={`${CARD_TITLE} mb-0`}>💬 Foro de Estudiantes</h3>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-md border border-line bg-bg px-2 py-1 text-xs text-ink outline-none focus:border-accent">
              <option value="recent">🕒 Más recientes</option>
              <option value="top_rated">⭐ Mejor valorados</option>
            </select>
          </div>

          <div className="mb-4 max-h-[400px] overflow-y-auto pr-1">
            {commentsLoading ? (
              <div className="p-8 text-center text-muted">
                <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-[3px] border-line border-t-accent" />
                <p className="m-0 text-sm">Cargando comentarios...</p>
              </div>
            ) : comments.length > 0 ? (
              comments.map(comment => renderComment(comment))
            ) : (
              <div className="p-8 text-center text-muted">
                <div className="mb-2 text-3xl">💬</div>
                <p className="m-0 text-sm">
                  No hay comentarios para este horario aún.
                  {canInteract && ' ¡Sé el primero en comentar!'}
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-line pt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={`min-h-[80px] w-full resize-y rounded-lg border border-line px-3 py-3 text-sm text-ink outline-none focus:border-accent ${
                canInteract ? 'bg-bg' : 'cursor-not-allowed bg-line/40'
              }`}
              placeholder={canInteract ? 'Comparte tu experiencia o haz una pregunta...' : 'Debes aprobar el curso para comentar...'}
              disabled={!canInteract}
            />

            <button
              onClick={handleAddComment}
              disabled={!canInteract || !newComment.trim()}
              className={`mt-3 w-full rounded-lg px-4 py-3 text-sm font-semibold transition-opacity ${
                canInteract && newComment.trim()
                  ? 'cursor-pointer bg-accent text-ink-on-accent hover:opacity-90'
                  : 'cursor-not-allowed bg-muted text-ink-on-accent/80'
              }`}
            >
              {canInteract ? '📝 Publicar Comentario' : '🔒 Requiere Aprobación del Curso'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPanel;
