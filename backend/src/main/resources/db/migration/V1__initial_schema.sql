CREATE TABLE app_user (
    id UUID PRIMARY KEY,
    full_name VARCHAR(140) NOT NULL,
    email VARCHAR(160) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT app_user_email_unique UNIQUE (email),
    CONSTRAINT app_user_status_check CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE app_user_role (
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT app_user_role_user_fk FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE,
    CONSTRAINT app_user_role_check CHECK (role IN ('OWNER', 'MANAGER'))
);

CREATE TABLE fair_location (
    id UUID PRIMARY KEY,
    name VARCHAR(140) NOT NULL,
    city VARCHAR(120) NOT NULL,
    state VARCHAR(60) NOT NULL,
    reference VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE fair_location_operating_day (
    fair_location_id UUID NOT NULL,
    operating_day VARCHAR(20) NOT NULL,
    PRIMARY KEY (fair_location_id, operating_day),
    CONSTRAINT fair_location_operating_day_fk
        FOREIGN KEY (fair_location_id) REFERENCES fair_location (id) ON DELETE CASCADE,
    CONSTRAINT fair_location_operating_day_check
        CHECK (operating_day IN (
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
            'SUNDAY'
        ))
);

CREATE TABLE employee (
    id UUID PRIMARY KEY,
    name VARCHAR(140) NOT NULL,
    document_number VARCHAR(32),
    role VARCHAR(120),
    default_daily_rate NUMERIC(19, 2),
    hired_on DATE,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT employee_status_check CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT employee_default_daily_rate_positive CHECK (
        default_daily_rate IS NULL OR default_daily_rate > 0
    )
);

CREATE TABLE cash_movement (
    id UUID PRIMARY KEY,
    fair_location_id UUID,
    type VARCHAR(20) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    occurred_on DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT cash_movement_fair_location_fk FOREIGN KEY (fair_location_id) REFERENCES fair_location (id),
    CONSTRAINT cash_movement_type_check CHECK (type IN ('INCOME', 'EXPENSE')),
    CONSTRAINT cash_movement_amount_positive CHECK (amount > 0)
);

CREATE TABLE employee_payment (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    cash_movement_id UUID,
    amount NUMERIC(19, 2) NOT NULL,
    paid_on DATE NOT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT employee_payment_employee_fk FOREIGN KEY (employee_id) REFERENCES employee (id),
    CONSTRAINT employee_payment_cash_movement_fk FOREIGN KEY (cash_movement_id) REFERENCES cash_movement (id),
    CONSTRAINT employee_payment_cash_movement_unique UNIQUE (cash_movement_id),
    CONSTRAINT employee_payment_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_cash_movement_occurred_on ON cash_movement (occurred_on);
CREATE INDEX idx_employee_payment_employee_id ON employee_payment (employee_id);
