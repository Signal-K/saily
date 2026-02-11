do $$
declare
  d date;
  u uuid;
  live_thread_id bigint;
  ongoing_thread_id bigint;
begin
  -- Seed the previous 10 days with both forum threads.
  for d in
    select (current_date - offs) as day_value
    from generate_series(1, 10) as offs
  loop
    perform public.ensure_forum_threads(d);

    select id into live_thread_id
    from public.forum_threads
    where puzzle_date = d and kind = 'daily_live';

    select id into ongoing_thread_id
    from public.forum_threads
    where puzzle_date = d and kind = 'ongoing';

    -- Add sample posts when at least one profile exists.
    select id into u
    from public.profiles
    limit 1;

    if u is not null then
      insert into public.forum_posts (thread_id, user_id, body, result_payload)
      values (
        live_thread_id,
        u,
        'Live takeaways for ' || to_char(d, 'YYYY-MM-DD') || '. Fast thread, spoiler-safe notes.',
        jsonb_build_object('puzzleDate', d::text, 'summary', 'Shared quick result')
      )
      on conflict do nothing;

      insert into public.forum_posts (thread_id, user_id, body)
      values (
        ongoing_thread_id,
        u,
        'Ongoing strategy discussion for ' || to_char(d, 'YYYY-MM-DD') || '. What pattern did you notice first?'
      )
      on conflict do nothing;
    end if;
  end loop;
end
$$;
