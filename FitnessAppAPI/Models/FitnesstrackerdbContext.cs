using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace FitnessAppAPI.Models;

public partial class FitnesstrackerdbContext : DbContext
{
    public FitnesstrackerdbContext()
    {
    }

    public FitnesstrackerdbContext(DbContextOptions<FitnesstrackerdbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Bodymeasurement> Bodymeasurements { get; set; }

    public virtual DbSet<Exerciselibrary> Exerciselibraries { get; set; }

    public virtual DbSet<Goal> Goals { get; set; }

    public virtual DbSet<Nutritionlog> Nutritionlogs { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Userprofile> Userprofiles { get; set; }

    public virtual DbSet<VwUserdashboard> VwUserdashboards { get; set; }

    public virtual DbSet<VwWeeklycalorietrend> VwWeeklycalorietrends { get; set; }

    public virtual DbSet<Workoutexercise> Workoutexercises { get; set; }

    public virtual DbSet<Workoutlog> Workoutlogs { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseMySQL("server=localhost;port=3306;database=fitnesstrackerdb;user=root;password=root;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bodymeasurement>(entity =>
        {
            entity.HasKey(e => e.MeasurementId).HasName("PRIMARY");

            entity.ToTable("bodymeasurements");

            entity.HasIndex(e => new { e.UserId, e.MeasuredAt }, "IX_BodyMeasurements_UserId_Date");

            entity.Property(e => e.MeasurementId).HasDefaultValueSql("'uuid()'");
            entity.Property(e => e.BicepCm).HasPrecision(5);
            entity.Property(e => e.BodyFatPercent).HasPrecision(4);
            entity.Property(e => e.ChestCm).HasPrecision(5);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");
            entity.Property(e => e.HipsCm).HasPrecision(5);
            entity.Property(e => e.MeasuredAt).HasColumnType("date");
            entity.Property(e => e.Notes).HasMaxLength(300);
            entity.Property(e => e.WaistCm).HasPrecision(5);
            entity.Property(e => e.WeightKg).HasPrecision(5);

            entity.HasOne(d => d.User).WithMany(p => p.Bodymeasurements)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_BodyMeasurements_Users");
        });

        modelBuilder.Entity<Exerciselibrary>(entity =>
        {
            entity.HasKey(e => e.ExerciseId).HasName("PRIMARY");

            entity.ToTable("exerciselibrary");

            entity.HasIndex(e => e.ExerciseName, "UQ_ExerciseLibrary_Name").IsUnique();

            entity.Property(e => e.ExerciseId).HasDefaultValueSql("'uuid()'");
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");
            entity.Property(e => e.DifficultyLevel)
                .HasMaxLength(20)
                .HasDefaultValueSql("'Beginner'");
            entity.Property(e => e.ExerciseName).HasMaxLength(200);
            entity.Property(e => e.Instructions).HasColumnType("text");
            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValueSql("'1'");
            entity.Property(e => e.MetValue)
                .HasPrecision(4)
                .HasDefaultValueSql("'1.00'");
            entity.Property(e => e.MuscleGroup).HasMaxLength(100);
        });

        modelBuilder.Entity<Goal>(entity =>
        {
            entity.HasKey(e => e.GoalId).HasName("PRIMARY");

            entity.ToTable("goals");

            entity.HasIndex(e => new { e.UserId, e.Status }, "IX_Goals_UserId_Status");

            entity.Property(e => e.GoalId).HasDefaultValueSql("'uuid()'");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");
            entity.Property(e => e.CurrentValue).HasPrecision(10);
            entity.Property(e => e.GoalName).HasMaxLength(200);
            entity.Property(e => e.GoalType).HasMaxLength(50);
            entity.Property(e => e.StartDate).HasColumnType("date");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'Active'");
            entity.Property(e => e.TargetDate).HasColumnType("date");
            entity.Property(e => e.TargetValue).HasPrecision(10);
            entity.Property(e => e.Unit).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");

            entity.HasOne(d => d.User).WithMany(p => p.Goals)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Goals_Users");
        });

        modelBuilder.Entity<Nutritionlog>(entity =>
        {
            entity.HasKey(e => e.NutritionLogId).HasName("PRIMARY");

            entity.ToTable("nutritionlogs");

            entity.HasIndex(e => new { e.UserId, e.LogDate }, "IX_NutritionLogs_UserId_Date");

            entity.Property(e => e.NutritionLogId).HasDefaultValueSql("'uuid()'");
            entity.Property(e => e.CaloriesKcal).HasPrecision(8);
            entity.Property(e => e.CarbsG).HasPrecision(6);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");
            entity.Property(e => e.FatG).HasPrecision(6);
            entity.Property(e => e.FoodName).HasMaxLength(200);
            entity.Property(e => e.LogDate).HasColumnType("date");
            entity.Property(e => e.MealType).HasMaxLength(30);
            entity.Property(e => e.ProteinG).HasPrecision(6);
            entity.Property(e => e.ServingAmount).HasPrecision(8);
            entity.Property(e => e.ServingUnit)
                .HasMaxLength(30)
                .HasDefaultValueSql("'g'");

            entity.HasOne(d => d.User).WithMany(p => p.Nutritionlogs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_NutritionLogs_Users");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PRIMARY");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "IX_Users_Email");

            entity.HasIndex(e => e.Email, "UQ_Users_Email").IsUnique();

            entity.HasIndex(e => e.Username, "UQ_Users_Username").IsUnique();

            entity.Property(e => e.UserId).HasDefaultValueSql("'uuid()'");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");
            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValueSql("'1'");
            entity.Property(e => e.LastLoginAt).HasColumnType("datetime");
            entity.Property(e => e.PasswordHash).HasMaxLength(512);
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");
            entity.Property(e => e.Username).HasMaxLength(100);
        });

        modelBuilder.Entity<Userprofile>(entity =>
        {
            entity.HasKey(e => e.ProfileId).HasName("PRIMARY");

            entity.ToTable("userprofiles");

            entity.HasIndex(e => e.UserId, "UQ_UserProfiles_UserId").IsUnique();

            entity.Property(e => e.ProfileId).HasDefaultValueSql("'uuid()'");
            entity.Property(e => e.ActivityLevel)
                .HasMaxLength(30)
                .HasDefaultValueSql("'Moderate'");
            entity.Property(e => e.CurrentWeightKg).HasPrecision(5);
            entity.Property(e => e.DateOfBirth).HasColumnType("date");
            entity.Property(e => e.FirstName).HasMaxLength(100);
            entity.Property(e => e.Gender).HasMaxLength(20);
            entity.Property(e => e.HeightCm).HasPrecision(5);
            entity.Property(e => e.LastName).HasMaxLength(100);
            entity.Property(e => e.PreferredUnits)
                .HasMaxLength(10)
                .HasDefaultValueSql("'Metric'");
            entity.Property(e => e.ProfilePicUrl).HasMaxLength(500);
            entity.Property(e => e.TargetWeightKg).HasPrecision(5);
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");

            entity.HasOne(d => d.User).WithOne(p => p.Userprofile)
                .HasForeignKey<Userprofile>(d => d.UserId)
                .HasConstraintName("FK_UserProfiles_Users");
        });

        modelBuilder.Entity<VwUserdashboard>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_userdashboard");

            entity.Property(e => e.ActivityLevel)
                .HasMaxLength(30)
                .HasDefaultValueSql("'Moderate'");
            entity.Property(e => e.CaloriesThisWeek).HasPrecision(30);
            entity.Property(e => e.CurrentWeightKg).HasPrecision(5);
            entity.Property(e => e.FullName).HasMaxLength(201);
            entity.Property(e => e.LastMeasuredAt).HasColumnType("date");
            entity.Property(e => e.LatestWeightKg).HasPrecision(5);
            entity.Property(e => e.TargetWeightKg).HasPrecision(5);
            entity.Property(e => e.UserId).HasDefaultValueSql("'uuid()'");
            entity.Property(e => e.Username).HasMaxLength(100);
        });

        modelBuilder.Entity<VwWeeklycalorietrend>(entity =>
        {
            entity
                .HasNoKey()
                .ToView("vw_weeklycalorietrend");

            entity.Property(e => e.TotalCalories).HasPrecision(30);
            entity.Property(e => e.TotalMinutes).HasPrecision(32);
            entity.Property(e => e.WeekStart).HasColumnType("date");
        });

        modelBuilder.Entity<Workoutexercise>(entity =>
        {
            entity.HasKey(e => e.WorkoutExerciseId).HasName("PRIMARY");

            entity.ToTable("workoutexercises");

            entity.HasIndex(e => e.ExerciseId, "FK_WorkoutExercises_Exercise");

            entity.HasIndex(e => new { e.WorkoutLogId, e.OrderIndex }, "IX_WorkoutExercises_WorkoutLogId");

            entity.Property(e => e.WorkoutExerciseId).HasDefaultValueSql("'uuid()'");
            entity.Property(e => e.CaloriesBurned).HasPrecision(6);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");
            entity.Property(e => e.DistanceKm).HasPrecision(8, 3);
            entity.Property(e => e.Notes).HasMaxLength(300);
            entity.Property(e => e.WeightKg).HasPrecision(6);

            entity.HasOne(d => d.Exercise).WithMany(p => p.Workoutexercises)
                .HasForeignKey(d => d.ExerciseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_WorkoutExercises_Exercise");

            entity.HasOne(d => d.WorkoutLog).WithMany(p => p.Workoutexercises)
                .HasForeignKey(d => d.WorkoutLogId)
                .HasConstraintName("FK_WorkoutExercises_Log");
        });

        modelBuilder.Entity<Workoutlog>(entity =>
        {
            entity.HasKey(e => e.WorkoutLogId).HasName("PRIMARY");

            entity.ToTable("workoutlogs");

            entity.HasIndex(e => new { e.UserId, e.WorkoutDate }, "IX_WorkoutLogs_UserId_Date");

            entity.Property(e => e.WorkoutLogId).HasDefaultValueSql("'uuid()'");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime");
            entity.Property(e => e.EndTime).HasColumnType("datetime");
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.StartTime).HasColumnType("datetime");
            entity.Property(e => e.TotalCaloriesBurned).HasPrecision(8);
            entity.Property(e => e.WorkoutDate).HasColumnType("date");
            entity.Property(e => e.WorkoutType).HasMaxLength(50);

            entity.HasOne(d => d.User).WithMany(p => p.Workoutlogs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_WorkoutLogs_Users");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
