+--- .claude
|    \--- settings.local.json
+--- .github
|    \--- workflows
|         +--- ci.yml
|         +--- e2e.yml
|         \--- lighthouse.yml
+--- .vscode
|    \--- settings.json
+--- mobile
|    +--- app
|    |    +--- (auth)
|    |    |    +--- forgot-password.tsx
|    |    |    +--- login.tsx
|    |    |    +--- signup.tsx
|    |    |    \--- _layout.tsx
|    |    +--- (tabs)
|    |    |    +--- badges.tsx
|    |    |    +--- catalog.tsx
|    |    |    +--- certificates.tsx
|    |    |    +--- index.tsx
|    |    |    +--- leaderboard.tsx
|    |    |    +--- my-courses.tsx
|    |    |    +--- notifications.tsx
|    |    |    +--- profile.tsx
|    |    |    \--- _layout.tsx
|    |    +--- course
|    |    |    \--- [courseId]
|    |    \--- _layout.tsx
|    +--- components
|    |    +--- BookmarkButton.tsx
|    |    +--- CourseCard.tsx
|    |    +--- NotificationRow.tsx
|    |    +--- ProgressBar.tsx
|    |    +--- QuizPlayerMobile.tsx
|    |    +--- SpeedControlSheet.tsx
|    |    +--- SplashScreen.tsx
|    |    +--- StreakDisplay.tsx
|    |    \--- VideoPlayer.tsx
|    +--- src
|    |    +--- lib
|    |    |    \--- supabase.ts
|    |    \--- globals.d.ts
|    +--- app.json
|    +--- eas.json
|    +--- lucide-react-native.d.ts
|    +--- nativewind-env.d.ts
|    +--- package.json
|    +--- tailwind.config.js
|    \--- tsconfig.json
+--- shared
|    +--- src
|    |    +--- types
|    |    |    +--- ai.types.ts
|    |    |    +--- announcement.types.ts
|    |    |    +--- assignment.types.ts
|    |    |    +--- audit.types.ts
|    |    |    +--- badge.types.ts
|    |    |    +--- certificate.types.ts
|    |    |    +--- common.types.ts
|    |    |    +--- course.types.ts
|    |    |    +--- enrollment.types.ts
|    |    |    +--- forum.types.ts
|    |    |    +--- index.ts
|    |    |    +--- integration.types.ts
|    |    |    +--- lesson.types.ts
|    |    |    +--- live-session.types.ts
|    |    |    +--- message.types.ts
|    |    |    +--- notification.types.ts
|    |    |    +--- organization.types.ts
|    |    |    +--- payment.types.ts
|    |    |    +--- quiz.types.ts
|    |    |    +--- study-group.types.ts
|    |    |    \--- user.types.ts
|    |    \--- index.ts
|    +--- types
|    |    \--- index.ts
|    +--- utils
|    |    \--- supabase.ts
|    +--- package.json
|    \--- tsconfig.json
+--- supabase
|    +--- .temp
|    |    +--- cli-latest
|    |    +--- gotrue-version
|    |    +--- linked-project.json
|    |    +--- pooler-url
|    |    +--- postgres-version
|    |    +--- project-ref
|    |    +--- rest-version
|    |    +--- storage-migration
|    |    \--- storage-version
|    +--- functions
|    |    +--- admin
|    |    |    +--- bulk-import-users
|    |    |    |    \--- index.ts
|    |    |    +--- change-user-role
|    |    |    |    \--- index.ts
|    |    |    +--- deactivate-user
|    |    |    |    \--- index.ts
|    |    |    +--- delete-user
|    |    |    |    \--- index.ts
|    |    |    +--- export-analytics
|    |    |    |    \--- index.ts
|    |    |    +--- impersonate-user
|    |    |    |    \--- index.ts
|    |    |    +--- moderate-course
|    |    |    |    \--- index.ts
|    |    |    +--- reactivate-user
|    |    |    |    \--- index.ts
|    |    |    \--- send-announcement
|    |    |         \--- index.ts
|    |    +--- ai
|    |    |    +--- adaptive-path
|    |    |    |    \--- index.ts
|    |    |    +--- at-risk-scan
|    |    |    |    \--- index.ts
|    |    |    +--- chat
|    |    |    |    \--- index.ts
|    |    |    +--- generate-quiz
|    |    |    |    \--- index.ts
|    |    |    +--- grade-essay
|    |    |    |    \--- index.ts
|    |    |    +--- recommendations
|    |    |    |    \--- index.ts
|    |    |    \--- summarize-lesson
|    |    |         \--- index.ts
|    |    +--- at-risk
|    |    |    \--- nudge
|    |    |         \--- index.ts
|    |    +--- captions
|    |    |    +--- generate
|    |    |    |    \--- index.ts
|    |    |    \--- poll
|    |    |         \--- index.ts
|    |    +--- certs
|    |    |    \--- generate
|    |    |         \--- index.ts
|    |    +--- check-rate-limit
|    |    |    \--- index.ts
|    |    +--- code
|    |    |    \--- run
|    |    |         \--- index.ts
|    |    +--- competency-check
|    |    |    \--- index.ts
|    |    +--- configure-sso
|    |    |    \--- index.ts
|    |    +--- delete-account
|    |    |    \--- index.ts
|    |    +--- embed-lesson
|    |    |    \--- index.ts
|    |    +--- export-user-data
|    |    |    \--- index.ts
|    |    +--- fire-webhooks
|    |    |    \--- index.ts
|    |    +--- forum
|    |    |    +--- moderate-reply
|    |    |    |    \--- index.ts
|    |    |    \--- moderate-thread
|    |    |         \--- index.ts
|    |    +--- gamification
|    |    |    +--- check-badges
|    |    |    |    \--- index.ts
|    |    |    \--- update-streak
|    |    |         \--- index.ts
|    |    +--- generate-invoice
|    |    |    \--- index.ts
|    |    +--- google-oauth-callback
|    |    |    \--- index.ts
|    |    +--- grade-quiz
|    |    |    \--- index.ts
|    |    +--- import-google-drive
|    |    |    \--- index.ts
|    |    +--- instructor
|    |    |    +--- publish-course
|    |    |    |    \--- index.ts
|    |    |    \--- reorder-lessons
|    |    |         \--- index.ts
|    |    +--- live
|    |    |    +--- create-room
|    |    |    |    \--- index.ts
|    |    |    +--- end-room
|    |    |    |    \--- index.ts
|    |    |    +--- notify
|    |    |    |    \--- index.ts
|    |    |    +--- recording-webhook
|    |    |    |    \--- index.ts
|    |    |    \--- recordings
|    |    |         \--- publish
|    |    |              \--- index.ts
|    |    +--- mark-instructor-paid
|    |    |    \--- index.ts
|    |    +--- mentorship
|    |    |    \--- match
|    |    |         \--- index.ts
|    |    +--- office-hours
|    |    |    \--- book
|    |    |         \--- index.ts
|    |    +--- payments
|    |    |    +--- create-order
|    |    |    |    \--- index.ts
|    |    |    +--- validate-coupon
|    |    |    |    \--- index.ts
|    |    |    +--- verify
|    |    |    |    \--- index.ts
|    |    |    \--- webhook
|    |    |         \--- index.ts
|    |    +--- peer-review
|    |    |    \--- assign
|    |    |         \--- index.ts
|    |    +--- proctoring-flag
|    |    |    \--- index.ts
|    |    +--- resolve-org
|    |    |    \--- index.ts
|    |    +--- retry-webhooks
|    |    |    \--- index.ts
|    |    +--- scorm
|    |    |    \--- process
|    |    |         \--- index.ts
|    |    +--- search
|    |    |    \--- semantic
|    |    |         \--- index.ts
|    |    +--- semester-rollover
|    |    |    \--- index.ts
|    |    +--- start-attempt
|    |    |    \--- index.ts
|    |    +--- submit-quiz
|    |    |    \--- index.ts
|    |    +--- sync-google-calendar
|    |    |    \--- index.ts
|    |    +--- update-streak
|    |    |    \--- index.ts
|    |    \--- _shared
|    |         +--- cors.ts
|    |         +--- gamification.ts
|    |         \--- supabase.ts
|    \--- migrations
|         +--- 20260521_phase0_foundation.sql
|         +--- 20260522000001_phase3.sql
|         +--- 20260523000001_phase12_forum_fix.sql
|         +--- 20260523000002_phase13_advanced_assessments.sql
|         +--- 20260523000003_phase14_17_rpcs.sql
|         +--- 20260523000004_phase14_live_learning.sql
|         +--- 20260523000005_phase15_social_collaboration.sql
|         +--- 20260523000006_phase16_rich_content.sql
|         +--- 20260523000007_phase17_advanced_ai.sql
|         +--- 20260523000008_phase2_public_pages.sql
|         +--- 20260523000009_phase8_gamification.sql
|         +--- 20260523000010_phase8_gamification_fix.sql
|         +--- 20260523000011_phase9_payments.sql
|         +--- 20260523000012_phase9_payments_fix.sql
|         +--- 20260523_phase12_forum.sql
|         +--- 20260524000013_phase_missing_rpcs_and_cron.sql
|         +--- 20260524000014_phase18_external_integrations.sql
|         +--- 20260524000015_phase19_payments_extended.sql
|         +--- 20260524000016_phase20_accessibility.sql
|         +--- 20260524000017_phase21_advanced_admin.sql
|         +--- 20260524000018_phase22_mobile_enhanced.sql
|         +--- 20260524000019_phase23_final_polish.sql
|         +--- 20260524000020_phase4_student_extended.sql
|         +--- 20260524000021_phase6_admin.sql
|         +--- 20260524000022_phase7_ai_core.sql
|         +--- 20260525000023_announcement_scheduler.sql
|         +--- 20260525000024_phase5_instructor.sql
|         +--- 20260525000025_phase8_gamification_supplement.sql
|         +--- phase4.sql
|         +--- phase5.sql
|         \--- phase5_instructor.sql
+--- web
|    +--- e2e
|    |    +--- admin.spec.ts
|    |    +--- assignment.spec.ts
|    |    +--- auth.spec.ts
|    |    +--- certificate.spec.ts
|    |    +--- checkout.spec.ts
|    |    +--- enrollment.spec.ts
|    |    +--- learning.spec.ts
|    |    +--- live-session.spec.ts
|    |    +--- offline.spec.ts
|    |    \--- quiz.spec.ts
|    +--- public
|    |    +--- locales
|    |    |    +--- ar
|    |    |    |    \--- translation.json
|    |    |    +--- de
|    |    |    |    \--- translation.json
|    |    |    +--- en
|    |    |    |    \--- translation.json
|    |    |    +--- es
|    |    |    |    \--- translation.json
|    |    |    +--- fr
|    |    |    |    \--- translation.json
|    |    |    +--- hi
|    |    |    |    \--- translation.json
|    |    |    +--- ja
|    |    |    |    \--- translation.json
|    |    |    +--- ko
|    |    |    |    \--- translation.json
|    |    |    +--- pt
|    |    |    |    \--- translation.json
|    |    |    \--- zh
|    |    |         \--- translation.json
|    |    \--- logo.svg
|    +--- src
|    |    +--- components
|    |    |    +--- admin
|    |    |    |    +--- AnnouncementComposer.tsx
|    |    |    |    +--- AuditLogTable.tsx
|    |    |    |    +--- BulkActionBar.tsx
|    |    |    |    +--- CourseModerateRow.tsx
|    |    |    |    +--- CsvImportModal.tsx
|    |    |    |    +--- ImpersonationBanner.tsx
|    |    |    |    +--- RejectDrawer.tsx
|    |    |    |    +--- UserDetailDrawer.tsx
|    |    |    |    \--- UserTable.tsx
|    |    |    +--- ai
|    |    |    |    +--- AiRateLimitBanner.tsx
|    |    |    |    +--- AiTutorButton.tsx
|    |    |    |    +--- AiTutorDrawer.tsx
|    |    |    |    +--- ChatMessage.tsx
|    |    |    |    +--- LessonSummaryPanel.tsx
|    |    |    |    +--- QuizGeneratorPanel.tsx
|    |    |    |    \--- StreamingMessage.tsx
|    |    |    +--- assignment
|    |    |    |    +--- AssignmentBrief.tsx
|    |    |    |    +--- FileUploadZone.tsx
|    |    |    |    \--- SubmissionHistory.tsx
|    |    |    +--- charts
|    |    |    |    \--- CompletionFunnelChart.tsx
|    |    |    +--- common
|    |    |    |    +--- EmptyState.tsx
|    |    |    |    +--- ErrorState.tsx
|    |    |    |    +--- LessonTypeBadge.tsx
|    |    |    |    +--- PageHeader.tsx
|    |    |    |    +--- Pagination.tsx
|    |    |    |    +--- PriceBadge.tsx
|    |    |    |    +--- ProgressRing.tsx
|    |    |    |    +--- ReadingModeOverlay.tsx
|    |    |    |    +--- SkeletonPage.tsx
|    |    |    |    +--- SkipToMainContent.tsx
|    |    |    |    +--- StarRating.tsx
|    |    |    |    +--- ThemeToggle.tsx
|    |    |    |    \--- TtsControls.tsx
|    |    |    +--- courses
|    |    |    |    +--- ActiveFilters.tsx
|    |    |    |    +--- CourseCard.tsx
|    |    |    |    +--- CourseCardSkeleton.tsx
|    |    |    |    +--- CourseStickyCard.tsx
|    |    |    |    +--- CurriculumAccordion.tsx
|    |    |    |    +--- EnrolledCourseCard.tsx
|    |    |    |    +--- EnrolledCourseCardSkeleton.tsx
|    |    |    |    +--- FilterDrawer.tsx
|    |    |    |    +--- FilterPanel.tsx
|    |    |    |    +--- InstructorBio.tsx
|    |    |    |    +--- PaymentModal.tsx
|    |    |    |    +--- RatingBreakdown.tsx
|    |    |    |    +--- ReviewCard.tsx
|    |    |    |    +--- ReviewCardSkeleton.tsx
|    |    |    |    \--- SortDropdown.tsx
|    |    |    +--- dashboard
|    |    |    |    +--- ContinueLearningCard.tsx
|    |    |    |    +--- CourseProgressWidget.tsx
|    |    |    |    +--- DashboardSkeleton.tsx
|    |    |    |    +--- DashboardStatCard.tsx
|    |    |    |    +--- StreakCalendar.tsx
|    |    |    |    \--- UpcomingDeadlines.tsx
|    |    |    +--- editor
|    |    |    |    \--- TipTapEditor.tsx
|    |    |    +--- forum
|    |    |    |    +--- AcceptedAnswerBadge.tsx
|    |    |    |    +--- AskQuestionModal.tsx
|    |    |    |    +--- CreateThreadModal.tsx
|    |    |    |    +--- InstructorBadge.tsx
|    |    |    |    +--- ModerationMenu.tsx
|    |    |    |    +--- QAQuestionItem.tsx
|    |    |    |    +--- ReplyComposer.tsx
|    |    |    |    +--- ReplyItem.tsx
|    |    |    |    +--- ThreadListItem.tsx
|    |    |    |    \--- VoteButton.tsx
|    |    |    +--- gamification
|    |    |    |    +--- BadgeCard.tsx
|    |    |    |    +--- BadgeCelebrationModal.tsx
|    |    |    |    +--- CertificateCard.tsx
|    |    |    |    +--- CertificateVerify.tsx
|    |    |    |    +--- LeaderboardTable.tsx
|    |    |    |    +--- LevelProgress.tsx
|    |    |    |    +--- PointsDisplay.tsx
|    |    |    |    \--- StreakCounter.tsx
|    |    |    +--- guards
|    |    |    |    +--- ErrorBoundary.tsx
|    |    |    |    +--- ProtectedRoute.tsx
|    |    |    |    \--- RoleGuard.tsx
|    |    |    +--- instructor
|    |    |    |    +--- grading
|    |    |    |    |    \--- GradingDrawer.tsx
|    |    |    |    +--- quiz
|    |    |    |    |    +--- QuestionEditor.tsx
|    |    |    |    |    \--- QuizBuilderDrawer.tsx
|    |    |    |    +--- AssignmentBuilderDrawer.tsx
|    |    |    |    +--- CourseBuilder.tsx
|    |    |    |    +--- CourseWizard.tsx
|    |    |    |    +--- CurriculumBuilder.tsx
|    |    |    |    +--- DropOffHeatmap.tsx
|    |    |    |    +--- LessonEditor.tsx
|    |    |    |    +--- ModuleTree.tsx
|    |    |    |    +--- RubricBuilder.tsx
|    |    |    |    +--- StudentProgressDrawer.tsx
|    |    |    |    \--- VideoUploadZone.tsx
|    |    |    +--- integrations
|    |    |    |    +--- CalendarSyncToggle.tsx
|    |    |    |    +--- DrivePickerButton.tsx
|    |    |    |    \--- ImportProgressModal.tsx
|    |    |    +--- layout
|    |    |    |    +--- AdminLayout.tsx
|    |    |    |    +--- AuthLayout.tsx
|    |    |    |    +--- InstructorLayout.tsx
|    |    |    |    +--- LessonLayout.tsx
|    |    |    |    +--- PublicLayout.tsx
|    |    |    |    +--- RoleAwareLayout.tsx
|    |    |    |    \--- StudentLayout.tsx
|    |    |    +--- live
|    |    |    |    +--- ActivityFeedItem.tsx
|    |    |    |    +--- AdaptivePathCard.tsx
|    |    |    |    +--- AIGradeSuggestionBadge.tsx
|    |    |    |    +--- AIProcessingBadge.tsx
|    |    |    |    +--- AtRiskPanel.tsx
|    |    |    |    +--- AtRiskTable.tsx
|    |    |    |    +--- CaptionStatusBadge.tsx
|    |    |    |    +--- CaptionTrackManager.tsx
|    |    |    |    +--- CodeLessonEditor.tsx
|    |    |    |    +--- CodeLessonPlayer.tsx
|    |    |    |    +--- CollabNotesConflictToast.tsx
|    |    |    |    +--- CollabNotesTab.tsx
|    |    |    |    +--- ContentTypeSelector.tsx
|    |    |    |    +--- CourseRecommendationsStrip.tsx
|    |    |    |    +--- CreateGroupDialog.tsx
|    |    |    |    +--- DailyIframeWrapper.tsx
|    |    |    |    +--- EmbedPlayer.tsx
|    |    |    |    +--- EngagementSparkline.tsx
|    |    |    |    +--- GradeWithAIButton.tsx
|    |    |    |    +--- GroupChatPanel.tsx
|    |    |    |    +--- GroupDocPanel.tsx
|    |    |    |    +--- H5PPlayer.tsx
|    |    |    |    +--- KaTeXRenderer.tsx
|    |    |    |    +--- LanguageSwitcher.tsx
|    |    |    |    +--- LiveSessionFormSheet.tsx
|    |    |    |    +--- MathLessonEditor.tsx
|    |    |    |    +--- MentorCard.tsx
|    |    |    |    +--- PeerFeedbackView.tsx
|    |    |    |    +--- PeerReviewDrawer.tsx
|    |    |    |    +--- PollModal.tsx
|    |    |    |    +--- PollsPanel.tsx
|    |    |    |    +--- PublishRecordingDialog.tsx
|    |    |    |    +--- QAQueuePanel.tsx
|    |    |    |    +--- RaiseHandButton.tsx
|    |    |    |    +--- RunCodeButton.tsx
|    |    |    |    +--- ScormPlayer.tsx
|    |    |    |    +--- ScormUploader.tsx
|    |    |    |    +--- SemanticSearchResult.tsx
|    |    |    |    +--- SemanticSearchToggle.tsx
|    |    |    |    +--- SessionControlBar.tsx
|    |    |    |    +--- TestCaseBuilder.tsx
|    |    |    |    +--- TestResultsPanel.tsx
|    |    |    |    +--- TypingIndicator.tsx
|    |    |    |    \--- WhiteboardPanel.tsx
|    |    |    +--- messages
|    |    |    |    +--- EmptyThreadState.tsx
|    |    |    |    +--- MessageBubble.tsx
|    |    |    |    +--- MessageComposer.tsx
|    |    |    |    +--- MessageSearchBar.tsx
|    |    |    |    +--- MessageThread.tsx
|    |    |    |    +--- OnlinePresenceDot.tsx
|    |    |    |    +--- ThreadList.tsx
|    |    |    |    \--- ThreadListItem.tsx
|    |    |    +--- modals
|    |    |    |    \--- CourseCompleteModal.tsx
|    |    |    +--- navigation
|    |    |    |    +--- GlobalSearch.tsx
|    |    |    |    +--- MobileBottomNav.tsx
|    |    |    |    +--- NotificationDropdown.tsx
|    |    |    |    +--- ProfileDropdown.tsx
|    |    |    |    +--- PublicFooter.tsx
|    |    |    |    +--- PublicNavbar.tsx
|    |    |    |    +--- Sidebar.tsx
|    |    |    |    \--- Topbar.tsx
|    |    |    +--- notifications
|    |    |    |    +--- EmptyNotificationsState.tsx
|    |    |    |    +--- NotificationBell.tsx
|    |    |    |    \--- NotificationItem.tsx
|    |    |    +--- payments
|    |    |    |    +--- CouponInput.tsx
|    |    |    |    +--- PaymentHistoryRow.tsx
|    |    |    |    +--- PaymentStatusBadge.tsx
|    |    |    |    +--- PricingCard.tsx
|    |    |    |    \--- ReferralCard.tsx
|    |    |    +--- player
|    |    |    |    +--- CoursePlayerSidebar.tsx
|    |    |    |    +--- CoursePlayerSkeleton.tsx
|    |    |    |    +--- LessonNavItem.tsx
|    |    |    |    +--- NotesPanel.tsx
|    |    |    |    +--- PDFViewer.tsx
|    |    |    |    +--- PlayerBottomBar.tsx
|    |    |    |    +--- PlayerTopBar.tsx
|    |    |    |    +--- TextLesson.tsx
|    |    |    |    +--- VideoBookmarks.tsx
|    |    |    |    \--- VideoPlayer.tsx
|    |    |    +--- profile
|    |    |    |    +--- AccessibilitySettingsForm.tsx
|    |    |    |    +--- AvatarUploader.tsx
|    |    |    |    +--- NotificationPreferencesForm.tsx
|    |    |    |    +--- PasswordChangeForm.tsx
|    |    |    |    +--- ProfileCard.tsx
|    |    |    |    +--- ProfileForm.tsx
|    |    |    |    \--- SocialLinksForm.tsx
|    |    |    +--- progress
|    |    |    |    +--- ActivityHeatmap.tsx
|    |    |    |    +--- CourseCompletionCard.tsx
|    |    |    |    +--- ScoreHistoryChart.tsx
|    |    |    |    +--- SkillBreakdownChart.tsx
|    |    |    |    +--- StatSummaryRow.tsx
|    |    |    |    \--- WeeklyActivityChart.tsx
|    |    |    +--- quiz
|    |    |    |    +--- AttemptsRemainingPill.tsx
|    |    |    |    +--- GateBlocker.tsx
|    |    |    |    +--- GracePeriodBanner.tsx
|    |    |    |    +--- ProctoringWarningModal.tsx
|    |    |    |    +--- QuestionEditDrawer.tsx
|    |    |    |    +--- QuizBankTab.tsx
|    |    |    |    +--- QuizNavigator.tsx
|    |    |    |    +--- QuizQuestion.tsx
|    |    |    |    +--- QuizResultsScreen.tsx
|    |    |    |    \--- QuizTimer.tsx
|    |    |    +--- search
|    |    |    |    +--- GlobalSearchModal.tsx
|    |    |    |    +--- SearchResultGroup.tsx
|    |    |    |    \--- SearchResultItem.tsx
|    |    |    +--- shared
|    |    |    |    +--- ConfirmDialog.tsx
|    |    |    |    +--- CourseBadge.tsx
|    |    |    |    +--- PageLoading.tsx
|    |    |    |    +--- PageTitle.tsx
|    |    |    |    +--- ProgressBar.tsx
|    |    |    |    +--- SEO.tsx
|    |    |    |    +--- SkeletonCard.tsx
|    |    |    |    +--- SkeletonList.tsx
|    |    |    |    +--- SkeletonTable.tsx
|    |    |    |    \--- UserAvatar.tsx
|    |    |    \--- ui
|    |    |         +--- accordion.tsx
|    |    |         +--- alert-dialog.tsx
|    |    |         +--- alert.tsx
|    |    |         +--- avatar.tsx
|    |    |         +--- badge.tsx
|    |    |         +--- button.tsx
|    |    |         +--- calendar.tsx
|    |    |         +--- card.tsx
|    |    |         +--- checkbox.tsx
|    |    |         +--- command.tsx
|    |    |         +--- dialog.tsx
|    |    |         +--- dropdown-menu.tsx
|    |    |         +--- form.tsx
|    |    |         +--- ImageUploadZone.tsx
|    |    |         +--- input.tsx
|    |    |         +--- KPICard.tsx
|    |    |         +--- label.tsx
|    |    |         +--- pagination.tsx
|    |    |         +--- popover.tsx
|    |    |         +--- progress.tsx
|    |    |         +--- radio-group.tsx
|    |    |         +--- scroll-area.tsx
|    |    |         +--- select.tsx
|    |    |         +--- separator.tsx
|    |    |         +--- sheet.tsx
|    |    |         +--- skeleton.tsx
|    |    |         +--- slider.tsx
|    |    |         +--- switch.tsx
|    |    |         +--- table.tsx
|    |    |         +--- tabs.tsx
|    |    |         +--- textarea.tsx
|    |    |         \--- tooltip.tsx
|    |    +--- hooks
|    |    |    +--- mutations
|    |    |    |    +--- useAdvancedQuizAttempt.ts
|    |    |    |    +--- useChangePassword.ts
|    |    |    |    +--- useMarkLessonComplete.ts
|    |    |    |    +--- useQuestionBank.ts
|    |    |    |    +--- useQuizAttempt.ts
|    |    |    |    +--- useSaveVideoPosition.ts
|    |    |    |    +--- useUpdateProfile.ts
|    |    |    |    \--- useUploadAvatar.ts
|    |    |    +--- queries
|    |    |    |    +--- useAdmin.ts
|    |    |    |    +--- useAssignment.ts
|    |    |    |    +--- useCertificates.ts
|    |    |    |    +--- useCompetency.ts
|    |    |    |    +--- useCourse.ts
|    |    |    |    +--- useCourseAnalytics.ts
|    |    |    |    +--- useCoursePlayer.ts
|    |    |    |    +--- useCourseReviews.ts
|    |    |    |    +--- useCourses.ts
|    |    |    |    +--- useEnrolledCourses.ts
|    |    |    |    +--- useEnrollmentStatus.ts
|    |    |    |    +--- useFeaturedCourses.ts
|    |    |    |    +--- useForum.ts
|    |    |    |    +--- useGamification.ts
|    |    |    |    +--- useInstructor.ts
|    |    |    |    +--- useMessages.ts
|    |    |    |    +--- useNotifications.ts
|    |    |    |    +--- usePayments.ts
|    |    |    |    +--- usePointsStreaks.ts
|    |    |    |    +--- useProgressAnalytics.ts
|    |    |    |    +--- useQuestionBank.ts
|    |    |    |    +--- useQuiz.ts
|    |    |    |    +--- useSearch.ts
|    |    |    |    +--- useStudentDashboard.ts
|    |    |    |    \--- useStudentNotes.ts
|    |    |    +--- realtime
|    |    |    |    +--- useMessageRealtime.ts
|    |    |    |    +--- useNotificationRealtime.ts
|    |    |    |    \--- usePresenceHeartbeat.ts
|    |    |    +--- useAuth.ts
|    |    |    +--- useDebounce.ts
|    |    |    +--- useFilterState.ts
|    |    |    +--- useMediaQuery.ts
|    |    |    +--- useProfile.ts
|    |    |    +--- useStream.ts
|    |    |    \--- useTextToSpeech.ts
|    |    +--- lib
|    |    |    +--- constants.ts
|    |    |    +--- database.types.ts
|    |    |    +--- i18n.ts
|    |    |    +--- mockData.ts
|    |    |    +--- queryClient.ts
|    |    |    +--- streakBootstrap.ts
|    |    |    +--- supabase.ts
|    |    |    +--- types.ts
|    |    |    \--- utils.ts
|    |    +--- pages
|    |    |    +--- admin
|    |    |    |    +--- AdminAnalytics.tsx
|    |    |    |    +--- AdminAnnouncements.tsx
|    |    |    |    +--- AdminAuditLogs.tsx
|    |    |    |    +--- AdminBulkImport.tsx
|    |    |    |    +--- AdminCompliancePage.tsx
|    |    |    |    +--- AdminCouponsPage.tsx
|    |    |    |    +--- AdminCourses.tsx
|    |    |    |    +--- AdminDashboard.tsx
|    |    |    |    +--- AdminDashboardExtensions.tsx
|    |    |    |    +--- AdminDataRetentionPage.tsx
|    |    |    |    +--- AdminDepartmentsPage.tsx
|    |    |    |    +--- AdminIntegrationsPage.tsx
|    |    |    |    +--- AdminNewUser.tsx
|    |    |    |    +--- AdminOrganizationsPage.tsx
|    |    |    |    +--- AdminReports.tsx
|    |    |    |    +--- AdminRevenuePage.tsx
|    |    |    |    +--- AdminSemestersPage.tsx
|    |    |    |    +--- AdminSettings.tsx
|    |    |    |    +--- AdminUserDetail.tsx
|    |    |    |    +--- AdminUsers.tsx
|    |    |    |    +--- AdminWaitlistsPage.tsx
|    |    |    |    \--- AdminWebhooksPage.tsx
|    |    |    +--- auth
|    |    |    |    +--- AuthCallbackPage.tsx
|    |    |    |    +--- ForgotPasswordPage.tsx
|    |    |    |    +--- LoginPage.tsx
|    |    |    |    +--- ResetPasswordPage.tsx
|    |    |    |    +--- SignupPage.tsx
|    |    |    |    \--- VerifyEmailPage.tsx
|    |    |    +--- errors
|    |    |    |    +--- ForbiddenPage.tsx
|    |    |    |    \--- NotFoundPage.tsx
|    |    |    +--- instructor
|    |    |    |    +--- CourseAnalyticsPage.tsx
|    |    |    |    +--- CourseBuilderPage.tsx
|    |    |    |    +--- GradebookPage.tsx
|    |    |    |    +--- InstructorCoursesPage.tsx
|    |    |    |    +--- InstructorDashboardPage.tsx
|    |    |    |    +--- InstructorLiveRoomPage.tsx
|    |    |    |    +--- InstructorOfficeHoursPage.tsx
|    |    |    |    +--- InstructorRevenuePage.tsx
|    |    |    |    +--- LessonEditorExtensions.tsx
|    |    |    |    +--- LiveSessionManagePage.tsx
|    |    |    |    +--- NewCoursePage.tsx
|    |    |    |    +--- ProctoringReviewPage.tsx
|    |    |    |    +--- QuestionBankPage.tsx
|    |    |    |    \--- RecordingsPage.tsx
|    |    |    +--- learn
|    |    |    |    +--- AssignmentPage.tsx
|    |    |    |    +--- CourseOverviewPage.tsx
|    |    |    |    +--- CoursePlayerPage.tsx
|    |    |    |    +--- CoursePlayerRedirect.tsx
|    |    |    |    +--- LessonPlayerPage.tsx
|    |    |    |    +--- LessonViewerPage.tsx
|    |    |    |    +--- QuizPage.tsx
|    |    |    |    +--- QuizPlayerPage.tsx
|    |    |    |    +--- StudentLiveListPage.tsx
|    |    |    |    +--- StudentLiveRoomPage.tsx
|    |    |    |    +--- StudentOfficeHoursPage.tsx
|    |    |    |    +--- StudyGroupRoomPage.tsx
|    |    |    |    \--- StudyGroupsListPage.tsx
|    |    |    +--- public
|    |    |    |    +--- AccessibilityPage.tsx
|    |    |    |    +--- CatalogPage.tsx
|    |    |    |    +--- CertificateVerifyPage.tsx
|    |    |    |    +--- CourseDetailPage.tsx
|    |    |    |    \--- LandingPage.tsx
|    |    |    +--- shared
|    |    |    |    +--- ActivityFeedPage.tsx
|    |    |    |    +--- AllNotesPage.tsx
|    |    |    |    +--- ForumPage.tsx
|    |    |    |    +--- ForumThreadPage.tsx
|    |    |    |    +--- GdprSettingsPage.tsx
|    |    |    |    +--- IntegrationsPage.tsx
|    |    |    |    +--- LeaderboardPage.tsx
|    |    |    |    +--- MentorshipPage.tsx
|    |    |    |    +--- MessagesPage.tsx
|    |    |    |    +--- NotificationsPage.tsx
|    |    |    |    +--- PaymentHistoryPage.tsx
|    |    |    |    +--- ProfileEditPage.tsx
|    |    |    |    +--- ProfilePage.tsx
|    |    |    |    +--- SearchPage.tsx
|    |    |    |    \--- ThreadDetailPage.tsx
|    |    |    \--- student
|    |    |         +--- ProgressPage.tsx
|    |    |         +--- StudentAnnouncements.tsx
|    |    |         +--- StudentBadges.tsx
|    |    |         +--- StudentCertificates.tsx
|    |    |         +--- StudentCourses.tsx
|    |    |         +--- StudentDashboard.tsx
|    |    |         +--- StudentDashboardExtensions.tsx
|    |    |         +--- StudentGrades.tsx
|    |    |         \--- StudentProgress.tsx
|    |    +--- store
|    |    |    +--- adminStore.ts
|    |    |    +--- aiStore.ts
|    |    |    +--- authStore.ts
|    |    |    +--- chatStore.ts
|    |    |    +--- coursePlayerStore.ts
|    |    |    +--- forumStore.ts
|    |    |    +--- gamificationStore.ts
|    |    |    +--- liveSessionStore.ts
|    |    |    +--- messageStore.ts
|    |    |    +--- notificationStore.ts
|    |    |    +--- paymentStore.ts
|    |    |    +--- quizStore.ts
|    |    |    \--- themeStore.ts
|    |    +--- test
|    |    |    +--- enrollment.test.ts
|    |    |    +--- Pagination.test.tsx
|    |    |    +--- setup.ts
|    |    |    +--- StarRating.test.tsx
|    |    |    \--- utils.test.ts
|    |    +--- App.tsx
|    |    +--- index.css
|    |    +--- main.tsx
|    |    \--- vite-env.d.ts
|    +--- .env
|    +--- components.json
|    +--- index.html
|    +--- lighthouse-budget.json
|    +--- package.json
|    +--- playwright.config.ts
|    +--- postcss.config.ts
|    +--- tailwind.config.ts
|    +--- tsconfig.app.json
|    +--- tsconfig.json
|    +--- tsconfig.node.json
|    +--- vercel.json
|    +--- vite.config.ts
|    \--- vitest.config.ts
+--- .env.example
+--- .gitignore
+--- .npmrc
+--- .prettierignore
+--- .prettierrc
+--- COMPREHENSIVE_PROJECT_DOCUMENTATION.md
+--- CURRENT_STATE_PRD.md
+--- EDUFLOW_FRONTEND_MASTER_PRD.md
+--- EduFlow_PRD_Phases_5_6_7.md
+--- eslint.config.js
+--- lighthouse-budget.json
+--- lint-staged.config.js
+--- package-lock.json
+--- package.json
+--- PHASE-1-PRD (1).md
+--- PHASE-2-PRD (1).md
+--- PHASE-2-TRD.md
+--- PHASE-4-PRD.md
+--- PROJECT_STRUCTURE.md
+--- supabase_push_debug.txt
+--- supabase_push_debug2.txt
+--- supabase_push_debug3.txt
+--- supabase_push_native_dns.txt
\--- supabase_push_output.txt
