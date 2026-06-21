CREATE OR REPLACE FUNCTION public.place_order_items(p_items JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_med_name TEXT;
  v_new_stock INT;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    UPDATE public.medications
      SET stock = stock - (v_item->>'quantity')::INT
      WHERE id = (v_item->>'medication_id')::UUID
        AND stock >= (v_item->>'quantity')::INT
      RETURNING stock, name INTO v_new_stock, v_med_name;

    IF v_new_stock IS NULL THEN
      SELECT name INTO v_med_name FROM public.medications WHERE id = (v_item->>'medication_id')::UUID;
      RAISE EXCEPTION 'Insufficient stock for "%"', COALESCE(v_med_name, (v_item->>'medication_id'))
        USING ERRCODE = 'P0002';
    END IF;
  END LOOP;

  INSERT INTO public.order_items (order_id, medication_id, quantity, unit_price)
  SELECT
    (v_item->>'order_id')::UUID,
    (v_item->>'medication_id')::UUID,
    (v_item->>'quantity')::INT,
    (v_item->>'unit_price')::NUMERIC
  FROM jsonb_array_elements(p_items) AS v_item;
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_order_items(JSONB) TO anon, authenticated;
