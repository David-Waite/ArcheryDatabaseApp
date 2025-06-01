import TextInput from "../../UI/TextInput/TextInput";
import FormContainer from "../../UI/FormContainer/FormContainer";

export default function EndForm({
  isLoading,
  title,
  arrows,
  error,
  handleNextEndButtonPress,
  setState,
}) {
  return (
    <>
      {isLoading ? (
        <p>Loading</p>
      ) : (
        <FormContainer
          header={<h2>{title}</h2>}
          main={
            <>
              {arrows.map((arrow, index) => {
                return (
                  <TextInput
                    key={index}
                    state={arrow}
                    arrowID={index}
                    arrow={true}
                    setState={setState}
                    placeholder={`Arrow: ${index + 1}`}
                    error={error}
                  />
                );
              })}
            </>
          }
          bottom={
            <div>
              {error && (
                <span>
                  <p>{error}</p>
                </span>
              )}

              <button onClick={handleNextEndButtonPress}>
                Start new round
              </button>
            </div>
          }
        ></FormContainer>
      )}
    </>
  );
}
